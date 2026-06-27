import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import {
    buildCompanyContext,
    buildCostSavingSummary,
    estimateCostSaving,
    mergeAiSelectionWithProgram,
    programToCandidateSummary,
    type SubsidyFormInput,
    type SubsidyResult,
} from "@/lib/subsidy";
import {
    fetchCertificationCost,
    gatherCandidates,
} from "@/lib/subsidy-repository";
import type { SubsidyProgramCandidate } from "@/lib/subsidy-program";

export const runtime = "edge";

const LiveMatchingSchema = z.object({
    analysis_summary: z.string().describe("선정 사업에 대한 종합 분석 요약 (한국어)"),
    recommended_subsidies: z.array(z.object({
        announcement_id: z.string().describe("후보 목록의 ID를 그대로 사용"),
        source: z.enum(["bizinfo", "kstartup"]).describe("후보의 출처"),
        relevance_score: z.number().describe("적합도 점수 0-100"),
        match_reasons: z.array(z.string()).describe("선정 이유 2-3개"),
        eligibility: z.string().describe("지원 대상 요약"),
        description: z.string().describe("지원 내용 요약"),
        budget: z.string().optional().describe("지원 규모 (공고에서 확인 가능한 경우)"),
    })).min(1).max(5),
    strategy_advice: z.string().describe("신청 전략 조언"),
});

const FallbackMatchingSchema = z.object({
    analysis_summary: z.string(),
    recommended_subsidies: z.array(z.object({
        title: z.string(),
        agency: z.string(),
        budget: z.string(),
        deadline: z.string(),
        eligibility: z.string(),
        description: z.string(),
        relevance_score: z.number(),
        link: z.string(),
    })).min(3).max(5),
    strategy_advice: z.string(),
});

function resolveDataSource(sources: string[]): SubsidyResult["data_source"] {
    if (sources.includes("database") && sources.includes("live_api")) return "hybrid";
    if (sources.includes("database")) return "database";
    return "bizinfo_live";
}

function buildFreshnessLabel(sources: string[]): string {
    const date = new Date().toISOString().split("T")[0];
    if (sources.includes("database") && sources.includes("live_api")) {
        return `${date} DB 캐시 + 실시간 API 병합`;
    }
    if (sources.includes("database")) {
        return `${date} DB 캐시 기반`;
    }
    return `${date} 기업마당/K-Startup 실시간 조회`;
}

async function matchWithCandidates(
    openai: OpenAI,
    input: SubsidyFormInput,
    candidates: SubsidyProgramCandidate[],
    sources: string[],
    certificationCost: string | null
): Promise<SubsidyResult | null> {
    if (candidates.length === 0) return null;

    const programMap = new Map(
        candidates.map((p) => [`${p.source}:${p.announcement_id}`, p])
    );

    const candidateList = candidates
        .slice(0, 30)
        .map((p, i) => programToCandidateSummary(p, i))
        .join("\n\n");

    const costContext = certificationCost
        ? `\n[인증 비용 정보]\n- 이전 규제 진단 결과: 예상 인증 비용 ${certificationCost}\n- 인증 비용 지원 사업을 우선 고려하세요.\n`
        : "";

    const prompt = `
당신은 한국 정부지원사업 매칭 전문가입니다.
아래는 기업마당 및 K-Startup에서 조회한 **실제 지원사업 공고** 목록입니다.

[중요 규칙]
1. 반드시 아래 후보 목록에 있는 사업만 선택하세요.
2. announcement_id와 source를 후보의 값과 정확히 일치시키세요.
3. 기업 정보와의 적합도가 높은 순으로 3~5개를 선정하세요.
4. 마감 상태가 "closed"인 사업은 제외하세요.
5. 한국어로 응답하세요.
${costContext}
[기업 정보]
${buildCompanyContext(input)}

[후보 지원사업 목록]
${candidateList}
`;

    const completion = await openai.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            {
                role: "system",
                content: "You match Korean government subsidy programs from a provided candidate list only. Never invent programs.",
            },
            { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(LiveMatchingSchema, "subsidy_live_matching"),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) return null;

    const recommended = parsed.recommended_subsidies
        .map((item: z.infer<typeof LiveMatchingSchema>["recommended_subsidies"][number]) => {
            const program = programMap.get(`${item.source}:${item.announcement_id}`);
            if (!program || program.deadline_status === "closed") return null;

            const merged = mergeAiSelectionWithProgram(item, program);
            const saving = estimateCostSaving(certificationCost, merged.budget);
            if (saving) merged.cost_saving_estimate = saving;
            return merged;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    if (recommended.length === 0) return null;

    return {
        analysis_summary: parsed.analysis_summary,
        recommended_subsidies: recommended,
        strategy_advice: parsed.strategy_advice,
        data_source: resolveDataSource(sources),
        data_freshness: buildFreshnessLabel(sources),
        candidate_count: candidates.length,
        certification_cost: certificationCost,
        cost_saving_summary: buildCostSavingSummary(certificationCost, recommended),
    };
}

async function matchWithAiFallback(
    openai: OpenAI,
    input: SubsidyFormInput,
    certificationCost: string | null
): Promise<SubsidyResult> {
    const costContext = certificationCost
        ? `\n- 이전 규제 진단 예상 인증 비용: ${certificationCost}`
        : "";

    const prompt = `
당신은 한국 정부지원사업 컨설턴트입니다.
아래 기업에 적합한 정부지원사업을 추천하세요.

[기업 정보]
${buildCompanyContext(input)}
${costContext}

[안내]
- 인증 지원, 수출 바우처, R&D, 창업 지원 관련 사업을 포함하세요.
- link 필드에는 기업마당(bizinfo.go.kr) 또는 K-Startup(k-startup.go.kr) 검색 URL을 제공하세요.
- 실시간 공고 데이터가 없으므로, 사용자에게 공식 포털에서 최신 공고를 확인하도록 안내하세요.
- 한국어로 응답하세요.
`;

    const completion = await openai.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            {
                role: "system",
                content: "You are a professional consultant for Korean government subsidies.",
            },
            { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(FallbackMatchingSchema, "subsidy_fallback_matching"),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) throw new Error("AI fallback parsing failed");

    const recommended = parsed.recommended_subsidies.map(
        (sub: z.infer<typeof FallbackMatchingSchema>["recommended_subsidies"][number]) => ({
            ...sub,
            official_url: sub.link,
            announcement_id: "",
            source: "ai" as const,
            match_reasons: [] as string[],
            deadline_status: "unknown" as const,
            cost_saving_estimate: estimateCostSaving(certificationCost, sub.budget),
        })
    );

    return {
        analysis_summary: parsed.analysis_summary,
        recommended_subsidies: recommended,
        strategy_advice: parsed.strategy_advice,
        data_source: "ai_fallback",
        data_freshness: "AI 추정 데이터 (DB/API 미연동 — 기업마당에서 최신 공고를 확인하세요)",
        certification_cost: certificationCost,
        cost_saving_summary: buildCostSavingSummary(certificationCost, recommended),
    };
}

export async function POST(req: Request) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const body = (await req.json()) as {
            productName?: string;
            category?: string;
            companyStage?: string;
            location?: string;
            interestArea?: string;
            userId?: string;
        };
        if (!body.productName?.trim()) {
            return NextResponse.json({ error: "제품명/사업명은 필수입니다." }, { status: 400 });
        }

        const input: SubsidyFormInput = {
            productName: body.productName,
            category: body.category || "",
            companyStage: body.companyStage as SubsidyFormInput["companyStage"],
            location: body.location as SubsidyFormInput["location"],
            interestArea: body.interestArea as SubsidyFormInput["interestArea"],
        };

        const certificationCost = await fetchCertificationCost(body.userId, input.productName);

        let result: SubsidyResult | null = null;

        try {
            const { candidates, sources } = await gatherCandidates(input);
            result = await matchWithCandidates(openai, input, candidates, sources, certificationCost);
        } catch (liveError) {
            console.error("Candidate matching failed:", liveError);
        }

        if (!result) {
            result = await matchWithAiFallback(openai, input, certificationCost);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Subsidy API Error:", error);
        return NextResponse.json({ error: "지원사업 매칭 중 오류가 발생했습니다." }, { status: 500 });
    }
}
