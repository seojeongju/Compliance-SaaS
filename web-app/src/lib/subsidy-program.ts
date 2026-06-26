/**
 * 통합 지원사업 공고 타입 (기업마당 / K-Startup 공통)
 */

export type SubsidySource = "bizinfo" | "kstartup";

export interface SubsidyProgramCandidate {
    announcement_id: string;
    source: SubsidySource;
    title: string;
    agency: string;
    executing_agency: string;
    category: string;
    description: string;
    target: string;
    application_period: string;
    official_url: string;
    application_url: string;
    hashtags: string[];
    published_at: string;
    deadline_status: "open" | "closing_soon" | "closed" | "unknown";
    deadline_date?: string | null;
}

export interface SubsidyProgramRow {
    id: string;
    external_id: string;
    source: SubsidySource;
    title: string;
    agency: string | null;
    category: string | null;
    description: string | null;
    target: string | null;
    application_period: string | null;
    deadline_date: string | null;
    official_url: string;
    application_url: string | null;
    hashtags: string[] | null;
    status: SubsidyProgramCandidate["deadline_status"];
    synced_at: string;
}

export function rowToCandidate(row: SubsidyProgramRow): SubsidyProgramCandidate {
    return {
        announcement_id: row.external_id,
        source: row.source,
        title: row.title,
        agency: row.agency || "미정",
        executing_agency: "",
        category: row.category || "",
        description: row.description || "",
        target: row.target || "",
        application_period: row.application_period || "상시 / 미정",
        official_url: row.official_url,
        application_url: row.application_url || "",
        hashtags: row.hashtags || [],
        published_at: row.synced_at,
        deadline_status: row.status,
        deadline_date: row.deadline_date,
    };
}

export function candidateToDbRow(candidate: SubsidyProgramCandidate) {
    return {
        external_id: candidate.announcement_id,
        source: candidate.source,
        title: candidate.title,
        agency: candidate.agency,
        category: candidate.category,
        description: candidate.description,
        target: candidate.target,
        application_period: candidate.application_period,
        deadline_date: candidate.deadline_date || null,
        official_url: candidate.official_url,
        application_url: candidate.application_url || null,
        hashtags: candidate.hashtags,
        status: candidate.deadline_status,
        raw_json: candidate,
        synced_at: new Date().toISOString(),
    };
}

export function candidateKey(candidate: Pick<SubsidyProgramCandidate, "source" | "announcement_id">): string {
    return `${candidate.source}:${candidate.announcement_id}`;
}

export function dedupeCandidates(candidates: SubsidyProgramCandidate[]): SubsidyProgramCandidate[] {
    const map = new Map<string, SubsidyProgramCandidate>();
    for (const c of candidates) {
        map.set(candidateKey(c), c);
    }
    return Array.from(map.values());
}
