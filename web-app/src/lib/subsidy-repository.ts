import { createSupabaseAdmin } from "./supabaseAdmin";
import { fetchBizinfoPrograms } from "./bizinfo";
import { fetchKStartupPrograms } from "./kstartup";
import {
    buildBizinfoHashtags,
    type SubsidyFormInput,
} from "./subsidy";
import {
    candidateToDbRow,
    dedupeCandidates,
    rowToCandidate,
    type SubsidyProgramCandidate,
    type SubsidyProgramRow,
} from "./subsidy-program";

const INTEREST_KEYWORDS: Record<string, string[]> = {
    certification: ["인증", "KC", "품질", "규격", "시험", "해외규격"],
    export: ["수출", "해외", "바우처", "글로벌", "진출"],
    rnd: ["R&D", "연구", "기술개발", "혁신", "개발"],
    marketing: ["마케팅", "판로", "홍보", "전시", "바이어"],
};

export function scoreProgram(
    program: SubsidyProgramCandidate,
    input: SubsidyFormInput
): number {
    let score = 0;
    const hashtags = buildBizinfoHashtags(input);
    const text = `${program.title} ${program.description} ${program.category}`.toLowerCase();

    for (const tag of program.hashtags) {
        if (hashtags.some((h) => tag.includes(h) || h.includes(tag))) {
            score += 15;
        }
    }

    const interest = input.interestArea || "certification";
    for (const kw of INTEREST_KEYWORDS[interest] || []) {
        if (text.includes(kw.toLowerCase())) score += 10;
    }

    if (input.companyStage === "initial" && /창업|스타트업|예비/.test(text)) score += 8;
    if (input.companyStage === "growth" && /도약|성장|벤처/.test(text)) score += 8;

    const locationTag = input.location || "Seoul";
    const locationMap: Record<string, string> = {
        Seoul: "서울", Gyeonggi: "경기", Busan: "부산",
    };
    if (locationMap[locationTag] && text.includes(locationMap[locationTag])) score += 5;

    if (program.deadline_status === "closing_soon") score += 8;
    else if (program.deadline_status === "open") score += 4;

    if (program.source === "bizinfo") score += 2;

    return score;
}

export async function searchProgramsFromDb(
    input: SubsidyFormInput,
    limit = 50
): Promise<SubsidyProgramCandidate[]> {
    const admin = createSupabaseAdmin();
    if (!admin) return [];

    const { data, error } = await admin
        .from("subsidy_programs")
        .select("*")
        .in("status", ["open", "closing_soon"])
        .order("synced_at", { ascending: false })
        .limit(200);

    if (error || !data) {
        console.warn("DB subsidy search failed:", error?.message);
        return [];
    }

    return (data as SubsidyProgramRow[])
        .map(rowToCandidate)
        .map((program) => ({ program, score: scoreProgram(program, input) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ program }) => program);
}

export async function fetchLivePrograms(
    input: SubsidyFormInput
): Promise<SubsidyProgramCandidate[]> {
    const hashtags = buildBizinfoHashtags(input);

    const [bizinfoResult, kstartupResult] = await Promise.all([
        fetchBizinfoPrograms({ hashtags, searchCount: 50 }),
        fetchKStartupPrograms(1, 50),
    ]);

    if (bizinfoResult.error) console.warn("Bizinfo live:", bizinfoResult.error);
    if (kstartupResult.error) console.warn("K-Startup live:", kstartupResult.error);

    return dedupeCandidates([
        ...bizinfoResult.programs,
        ...kstartupResult.programs,
    ]);
}

export async function gatherCandidates(
    input: SubsidyFormInput
): Promise<{ candidates: SubsidyProgramCandidate[]; sources: string[] }> {
    const [dbPrograms, livePrograms] = await Promise.all([
        searchProgramsFromDb(input, 40),
        fetchLivePrograms(input),
    ]);

    const sources: string[] = [];
    if (dbPrograms.length > 0) sources.push("database");
    if (livePrograms.length > 0) sources.push("live_api");

    const merged = dedupeCandidates([...livePrograms, ...dbPrograms]);

    const scored = merged
        .map((program) => ({ program, score: scoreProgram(program, input) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 40)
        .map(({ program }) => program);

    return { candidates: scored, sources };
}

export async function upsertPrograms(programs: SubsidyProgramCandidate[]): Promise<number> {
    const admin = createSupabaseAdmin();
    if (!admin || programs.length === 0) return 0;

    const rows = programs.map(candidateToDbRow);

    const { error } = await admin
        .from("subsidy_programs")
        .upsert(rows, { onConflict: "source,external_id" });

    if (error) {
        throw new Error(`Upsert failed: ${error.message}`);
    }

    return rows.length;
}

export async function fetchCertificationCost(
    userId: string | undefined,
    productName: string
): Promise<string | null> {
    if (!userId) return null;

    const admin = createSupabaseAdmin();
    if (!admin) return null;

    const { data } = await admin
        .from("diagnostic_results")
        .select("result_json, product_name")
        .eq("user_id", userId)
        .ilike("product_name", productName)
        .is("tool_type", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!data?.result_json) return null;

    const result = data.result_json as { estimated_cost?: string };
    return result.estimated_cost || null;
}
