import type { RecommendedSubsidy } from "./subsidy";

export const BIZINFO_DETAIL_URL =
    "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do";
export const BIZINFO_LIST_URL =
    "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do";
export const BIZINFO_HOME_URL = "https://www.bizinfo.go.kr/";

const PBLANC_ID_PATTERN = /^PBLN_\d+$/i;

export function extractPblancId(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (PBLANC_ID_PATTERN.test(trimmed)) return trimmed;

    const fromQuery = trimmed.match(/[?&]pblancId=([^&]+)/i);
    if (fromQuery) {
        const decoded = decodeURIComponent(fromQuery[1]);
        return PBLANC_ID_PATTERN.test(decoded) ? decoded : null;
    }

    return null;
}

export function buildBizinfoDetailUrl(pblancId: string): string {
    const id = extractPblancId(pblancId);
    if (!id) return "";
    return `${BIZINFO_DETAIL_URL}?pblancId=${encodeURIComponent(id)}`;
}

export function buildBizinfoSearchUrl(keyword: string): string {
    const trimmed = keyword.trim();
    if (!trimmed) return BIZINFO_LIST_URL;
    return `${BIZINFO_LIST_URL}?searchKeyword=${encodeURIComponent(trimmed)}`;
}

export function resolveBizinfoOfficialUrl(
    rawUrl: string | undefined,
    announcementId: string | undefined
): string {
    const pblancId =
        extractPblancId(announcementId || "") || extractPblancId(rawUrl || "");
    if (pblancId) return buildBizinfoDetailUrl(pblancId);

    if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
        try {
            const host = new URL(rawUrl).hostname;
            if (host.endsWith("bizinfo.go.kr")) {
                return buildBizinfoSearchUrl("");
            }
        } catch {
            return "";
        }
    }

    return "";
}

export function resolveSubsidyOfficialUrl(
    subsidy: {
        official_url?: string;
        link?: string;
        announcement_id?: string;
        title?: string;
        source?: RecommendedSubsidy["source"];
    }
): string {
    const rawUrl = subsidy.official_url || subsidy.link || "";

    if (subsidy.source === "bizinfo") {
        const detailUrl = resolveBizinfoOfficialUrl(rawUrl, subsidy.announcement_id);
        if (detailUrl) return detailUrl;
    }

    if (subsidy.source === "kstartup" && rawUrl && /^https?:\/\//i.test(rawUrl)) {
        return rawUrl;
    }

    if (subsidy.source === "ai" || !subsidy.announcement_id) {
        if (subsidy.title?.trim()) {
            return buildBizinfoSearchUrl(subsidy.title);
        }
        return BIZINFO_LIST_URL;
    }

    const pblancId = extractPblancId(rawUrl);
    if (pblancId) return buildBizinfoDetailUrl(pblancId);

    if (rawUrl && /^https?:\/\//i.test(rawUrl)) return rawUrl;

    if (subsidy.title?.trim()) {
        return buildBizinfoSearchUrl(subsidy.title);
    }

    return "";
}
