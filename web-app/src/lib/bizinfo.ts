/**
 * 기업마당(bizinfo.go.kr) 지원사업정보 API 클라이언트
 * @see https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do?id=bizinfoApi
 */

import type { SubsidyProgramCandidate } from "./subsidy-program";

const BIZINFO_API_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

/** @deprecated SubsidyProgramCandidate 사용 권장 */
export type BizinfoProgram = SubsidyProgramCandidate;

export interface BizinfoSearchParams {
    hashtags?: string[];
    searchCount?: number;
    categoryId?: string;
}

interface BizinfoRawItem {
    title?: string;
    pblancNm?: string;
    link?: string;
    pblancUrl?: string;
    seq?: string;
    pblancId?: string;
    author?: string;
    jrsdInsttNm?: string;
    excInsttNm?: string;
    description?: string;
    bsnsSumryCn?: string;
    lcategory?: string;
    pldirSportRealmLclasCodeNm?: string;
    trgetNm?: string;
    reqstDt?: string;
    reqstBeginEndDe?: string;
    hashTags?: string;
    pubDate?: string;
    creatPnttm?: string;
    rceptEngnHmpgUrl?: string;
}

function parseDeadlineStatus(period: string): SubsidyProgramCandidate["deadline_status"] {
    if (!period || period.trim() === "") return "unknown";

    const endMatch = period.match(/(\d{4})[-.]?(\d{2})[-.]?(\d{2})\s*$/);
    if (!endMatch) {
        const rangeMatch = period.match(/~\s*(\d{4})[-.]?(\d{2})[-.]?(\d{2})/);
        if (!rangeMatch) return "unknown";
        const endDate = new Date(
            parseInt(rangeMatch[1]),
            parseInt(rangeMatch[2]) - 1,
            parseInt(rangeMatch[3])
        );
        return classifyDeadline(endDate);
    }

    const endDate = new Date(
        parseInt(endMatch[1]),
        parseInt(endMatch[2]) - 1,
        parseInt(endMatch[3])
    );
    return classifyDeadline(endDate);
}

function classifyDeadline(endDate: Date): SubsidyProgramCandidate["deadline_status"] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (endDate < now) return "closed";

    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return "closing_soon";
    return "open";
}

function parseDeadlineDate(period: string): string | null {
    const rangeMatch = period.match(/~\s*(\d{4})[-.]?(\d{2})[-.]?(\d{2})/);
    if (rangeMatch) {
        return `${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`;
    }
    const endMatch = period.match(/(\d{4})[-.]?(\d{2})[-.]?(\d{2})\s*$/);
    if (endMatch) {
        return `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}`;
    }
    return null;
}

function normalizeItem(item: BizinfoRawItem): SubsidyProgramCandidate | null {
    const announcement_id = item.seq || item.pblancId || "";
    const title = item.pblancNm || item.title || "";
    const official_url = item.pblancUrl || item.link || "";

    if (!announcement_id || !title) return null;

    const application_period = item.reqstBeginEndDe || item.reqstDt || "상시 / 미정";
    const description = item.bsnsSumryCn || item.description || "";
    const hashtags = (item.hashTags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    return {
        announcement_id,
        source: "bizinfo",
        title,
        agency: item.jrsdInsttNm || item.author || "미정",
        executing_agency: item.excInsttNm || "",
        category: item.pldirSportRealmLclasCodeNm || item.lcategory || "",
        description,
        target: item.trgetNm || "",
        application_period,
        official_url,
        application_url: item.rceptEngnHmpgUrl || "",
        hashtags,
        published_at: item.creatPnttm || item.pubDate || "",
        deadline_status: parseDeadlineStatus(application_period),
        deadline_date: parseDeadlineDate(application_period),
    };
}

function extractItems(data: unknown): BizinfoRawItem[] {
    if (!data || typeof data !== "object") return [];

    const root = data as Record<string, unknown>;
    const jsonArray = root.jsonArray ?? root;

    if (Array.isArray(jsonArray)) {
        return jsonArray as BizinfoRawItem[];
    }

    if (typeof jsonArray === "object" && jsonArray !== null) {
        const arr = (jsonArray as Record<string, unknown>).item;
        if (!arr) return [];
        return Array.isArray(arr) ? (arr as BizinfoRawItem[]) : [arr as BizinfoRawItem];
    }

    return [];
}

export async function fetchBizinfoPrograms(
    params: BizinfoSearchParams = {}
): Promise<{ programs: SubsidyProgramCandidate[]; error?: string }> {
    const apiKey = process.env.BIZINFO_API_KEY;

    if (!apiKey) {
        return { programs: [], error: "BIZINFO_API_KEY not configured" };
    }

    const searchParams = new URLSearchParams({
        crtfcKey: apiKey,
        dataType: "json",
        searchCnt: String(params.searchCount ?? 50),
    });

    if (params.hashtags?.length) {
        searchParams.set("hashtags", params.hashtags.join(","));
    }
    if (params.categoryId) {
        searchParams.set("searchLclasId", params.categoryId);
    }

    try {
        const response = await fetch(`${BIZINFO_API_URL}?${searchParams.toString()}`, {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return { programs: [], error: `Bizinfo API HTTP ${response.status}` };
        }

        const data = await response.json();
        const items = extractItems(data);

        const programs = items
            .map(normalizeItem)
            .filter((p): p is SubsidyProgramCandidate => p !== null)
            .filter((p) => p.deadline_status !== "closed");

        return { programs };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { programs: [], error: `Bizinfo API fetch failed: ${message}` };
    }
}
