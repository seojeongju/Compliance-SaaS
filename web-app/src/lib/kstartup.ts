/**
 * K-Startup 창업지원사업 공고 API
 * @see https://www.data.go.kr/data/15125364/openapi.do
 */

import type { SubsidyProgramCandidate } from "./subsidy-program";

const KSTARTUP_API_URL =
    "http://openapi.kised.or.kr/openapi/service/rest/ContentsService/getAnnouncementList";

interface KStartupRawItem {
    bizpbancseq?: string;
    biztitle?: string;
    organization?: string;
    detaileurl?: string;
    detailurl?: string;
    startdate?: string;
    enddate?: string;
    posttarget?: string;
    biztype?: string;
    contents?: string;
    bizsummary?: string;
}

function parseKStartupDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.length < 8) return null;
    const y = parseInt(dateStr.slice(0, 4));
    const m = parseInt(dateStr.slice(4, 6)) - 1;
    const d = parseInt(dateStr.slice(6, 8));
    return new Date(y, m, d);
}

function classifyDeadline(endDate: Date | null): SubsidyProgramCandidate["deadline_status"] {
    if (!endDate) return "unknown";

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (endDate < now) return "closed";

    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return "closing_soon";
    return "open";
}

function formatPeriod(start?: string, end?: string): string {
    if (start && end) {
        return `${start.slice(0, 4)}.${start.slice(4, 6)}.${start.slice(6, 8)} ~ ${end.slice(0, 4)}.${end.slice(4, 6)}.${end.slice(6, 8)}`;
    }
    if (end) return `~ ${end.slice(0, 4)}.${end.slice(4, 6)}.${end.slice(6, 8)}`;
    return "상시 / 미정";
}

function normalizeItem(item: KStartupRawItem): SubsidyProgramCandidate | null {
    const announcement_id = item.bizpbancseq || "";
    const title = item.biztitle || "";
    const official_url = item.detailurl || item.detaileurl || "";

    if (!announcement_id || !title) return null;

    const endDate = parseKStartupDate(item.enddate || "");
    const deadline_status = classifyDeadline(endDate);
    const description = item.bizsummary || item.contents || "";

    return {
        announcement_id,
        source: "kstartup",
        title,
        agency: item.organization || "창업진흥원",
        executing_agency: "",
        category: item.biztype || "창업",
        description,
        target: item.posttarget || "",
        application_period: formatPeriod(item.startdate, item.enddate),
        official_url: official_url || `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do`,
        application_url: official_url || "",
        hashtags: ["창업", "K-Startup", item.biztype || ""].filter(Boolean),
        published_at: item.startdate || "",
        deadline_status,
        deadline_date: endDate ? endDate.toISOString().split("T")[0] : null,
    };
}

function extractItems(data: unknown): KStartupRawItem[] {
    if (!data || typeof data !== "object") return [];

    const root = data as Record<string, unknown>;
    const response = root.response as Record<string, unknown> | undefined;
    const body = response?.body as Record<string, unknown> | undefined;
    const items = body?.items as Record<string, unknown> | undefined;
    const item = items?.item;

    if (!item) return [];
    return Array.isArray(item) ? (item as KStartupRawItem[]) : [item as KStartupRawItem];
}

export async function fetchKStartupPrograms(
    pageNo = 1,
    numOfRows = 50
): Promise<{ programs: SubsidyProgramCandidate[]; error?: string }> {
    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY;

    if (!serviceKey) {
        return { programs: [], error: "PUBLIC_DATA_SERVICE_KEY not configured" };
    }

    const searchParams = new URLSearchParams({
        serviceKey,
        pageNo: String(pageNo),
        numOfRows: String(numOfRows),
        resultType: "json",
    });

    try {
        const response = await fetch(`${KSTARTUP_API_URL}?${searchParams.toString()}`, {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            return { programs: [], error: `K-Startup API HTTP ${response.status}` };
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
        return { programs: [], error: `K-Startup API fetch failed: ${message}` };
    }
}
