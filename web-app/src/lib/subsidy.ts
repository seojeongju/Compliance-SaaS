import type { SubsidyProgramCandidate } from "./subsidy-program";

export type SubsidyInterestArea = "certification" | "export" | "rnd" | "marketing";
export type SubsidyCompanyStage = "initial" | "growth" | "mature";

export interface SubsidyFormInput {
    productName: string;
    category: string;
    companyStage?: SubsidyCompanyStage;
    location?: string;
    interestArea?: SubsidyInterestArea;
}

export interface RecommendedSubsidy {
    title: string;
    agency: string;
    budget: string;
    deadline: string;
    deadline_status: "open" | "closing_soon" | "closed" | "unknown";
    eligibility: string;
    description: string;
    relevance_score: number;
    link: string;
    official_url: string;
    announcement_id: string;
    source: "bizinfo" | "kstartup" | "ai";
    match_reasons: string[];
    application_url?: string;
    category?: string;
    cost_saving_estimate?: string;
}

export interface SubsidyResult {
    analysis_summary: string;
    recommended_subsidies: RecommendedSubsidy[];
    strategy_advice: string;
    data_source: "bizinfo_live" | "database" | "hybrid" | "ai_fallback";
    data_freshness: string;
    candidate_count?: number;
    certification_cost?: string | null;
    cost_saving_summary?: string;
}

const INTEREST_HASHTAGS: Record<SubsidyInterestArea, string[]> = {
    certification: ["인증", "품질", "기술", "KC"],
    export: ["수출", "해외진출", "바우처", "글로벌"],
    rnd: ["R&D", "기술개발", "연구", "혁신"],
    marketing: ["마케팅", "판로", "홍보", "전시"],
};

const STAGE_HASHTAGS: Record<SubsidyCompanyStage, string[]> = {
    initial: ["창업", "스타트업", "예비창업"],
    growth: ["도약", "성장", "벤처"],
    mature: ["중소기업", "제조"],
};

const LOCATION_HASHTAGS: Record<string, string> = {
    Seoul: "서울",
    Gyeonggi: "경기",
    Busan: "부산",
    Incheon: "인천",
    Daegu: "대구",
    Gwangju: "광주",
    Daejeon: "대전",
    Ulsan: "울산",
    Sejong: "세종",
    Gangwon: "강원",
    Chungbuk: "충북",
    Chungnam: "충남",
    Jeonbuk: "전북",
    Jeonnam: "전남",
    Gyeongbuk: "경북",
    Gyeongnam: "경남",
    Jeju: "제주",
};

const INTEREST_LABELS: Record<SubsidyInterestArea, string> = {
    certification: "국내/외 인증 비용 지원",
    export: "해외 진출 및 수출 바우처",
    rnd: "R&D 및 기술 개발",
    marketing: "마케팅 및 판로 개척",
};

const STAGE_LABELS: Record<SubsidyCompanyStage, string> = {
    initial: "예비창업 / 초기 (3년 미만)",
    growth: "도약 / 성장 (3~7년)",
    mature: "성숙 / 안정 (7년 이상)",
};

export function buildBizinfoHashtags(input: SubsidyFormInput): string[] {
    const tags = new Set<string>();

    const interest = input.interestArea || "certification";
    INTEREST_HASHTAGS[interest].forEach((t) => tags.add(t));

    const stage = input.companyStage || "initial";
    STAGE_HASHTAGS[stage].forEach((t) => tags.add(t));

    const locationTag = LOCATION_HASHTAGS[input.location || "Seoul"];
    if (locationTag) tags.add(locationTag);

    return Array.from(tags);
}

export function buildCompanyContext(input: SubsidyFormInput): string {
    const interest = input.interestArea || "certification";
    const stage = input.companyStage || "initial";

    return [
        `- 제품/사업명: ${input.productName}`,
        `- 업종/카테고리: ${input.category}`,
        `- 기업 성장 단계: ${STAGE_LABELS[stage]}`,
        `- 소재지: ${input.location || "Seoul"}`,
        `- 주요 관심 분야: ${INTEREST_LABELS[interest]}`,
    ].join("\n");
}

export function programToCandidateSummary(program: SubsidyProgramCandidate, index: number): string {
    return [
        `[${index}] ID: ${program.announcement_id}`,
        `  사업명: ${program.title}`,
        `  소관기관: ${program.agency}`,
        `  분야: ${program.category}`,
        `  지원대상: ${program.target || "미정"}`,
        `  신청기간: ${program.application_period}`,
        `  마감상태: ${program.deadline_status}`,
        `  사업개요: ${program.description.slice(0, 200)}`,
        `  출처: ${program.source}`,
        `  해시태그: ${program.hashtags.join(", ")}`,
    ].join("\n");
}

export function mergeAiSelectionWithProgram(
    aiItem: {
        announcement_id: string;
        relevance_score: number;
        match_reasons: string[];
        eligibility: string;
        description: string;
        budget?: string;
    },
    program: SubsidyProgramCandidate
): RecommendedSubsidy {
    return {
        title: program.title,
        agency: program.agency,
        budget: aiItem.budget || "공고문 참조",
        deadline: program.application_period,
        deadline_status: program.deadline_status,
        eligibility: aiItem.eligibility || program.target || "공고문 참조",
        description: aiItem.description || program.description,
        relevance_score: aiItem.relevance_score,
        link: program.official_url,
        official_url: program.official_url,
        announcement_id: program.announcement_id,
        source: program.source,
        match_reasons: aiItem.match_reasons,
        application_url: program.application_url || undefined,
        category: program.category,
    };
}

/** 인증 비용 문자열에서 숫자(만원 단위) 추출 */
export function parseCostInManwon(costStr: string): { min: number; max: number } | null {
    const numbers = costStr.match(/(\d+(?:\.\d+)?)\s*만\s*원?/g);
    if (!numbers || numbers.length === 0) return null;

    const values = numbers.map((n) => parseFloat(n.replace(/[^\d.]/g, "")));
    return { min: Math.min(...values), max: Math.max(...values) };
}

export function estimateCostSaving(
    certificationCost: string | null,
    subsidyBudget: string
): string | undefined {
    if (!certificationCost) return undefined;

    const certCost = parseCostInManwon(certificationCost);
    const subsidyAmount = parseCostInManwon(subsidyBudget);

    if (!certCost || !subsidyAmount) return undefined;

    const savingMax = Math.min(certCost.max, subsidyAmount.max);
    if (savingMax <= 0) return undefined;

    const pct = Math.round((savingMax / certCost.max) * 100);
    return `인증 예상 비용 ${certificationCost} 대비 최대 ${savingMax}만원 절감 가능 (약 ${pct}%)`;
}

export function buildCostSavingSummary(
    certificationCost: string | null,
    subsidies: RecommendedSubsidy[]
): string | undefined {
    if (!certificationCost) return undefined;

    const estimates = subsidies
        .map((s) => estimateCostSaving(certificationCost, s.budget))
        .filter(Boolean);

    if (estimates.length === 0) {
        return `귀사의 인증 예상 비용은 ${certificationCost}입니다. 위 지원사업을 활용하면 인증 비용 부담을 줄일 수 있습니다.`;
    }

    return estimates[0];
}

export function getSubsidyLink(subsidy: Pick<RecommendedSubsidy, "official_url" | "link">): string {
    return subsidy.official_url || subsidy.link || "";
}
