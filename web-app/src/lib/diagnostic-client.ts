import { apiFetch, getSession, type SessionUser } from "./auth-client";

export { getSession };

export async function saveDiagnosticResult(input: {
    product_name: string;
    category: string;
    description?: string | null;
    result_json: unknown;
    tool_type?: string | null;
    userId?: string | null;
}): Promise<string | null> {
    const res = await apiFetch("/api/diagnostic-results", {
        method: "POST",
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn("Diagnostic save failed:", data);
        return null;
    }
    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
}

export async function listDiagnosticResults(toolType?: string | null) {
    const params = new URLSearchParams();
    if (toolType === null) params.set("tool_type", "null");
    else if (toolType) params.set("tool_type", toolType);

    const res = await apiFetch(`/api/diagnostic-results?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { diagnostics: unknown[] };
    return data.diagnostics;
}

export async function deleteDiagnosticResult(id: string) {
    return apiFetch(`/api/diagnostic-results?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

export async function fetchDashboardStats() {
    const res = await apiFetch("/api/documents?mode=stats");
    if (!res.ok) return { diagnosticCount: 0, documentCount: 0 };
    return res.json() as Promise<{ diagnosticCount: number; documentCount: number }>;
}

export async function fetchRecentDiagnostics(limit = 3) {
    const res = await apiFetch(`/api/diagnostic-results?limit=${limit}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { diagnostics: unknown[] };
    return data.diagnostics;
}

export async function fetchProfile(): Promise<{
    profile: Record<string, unknown> | null;
    user: SessionUser | null;
}> {
    const res = await apiFetch("/api/profile");
    if (!res.ok) return { profile: null, user: null };
    return res.json() as Promise<{ profile: Record<string, unknown> | null; user: SessionUser | null }>;
}
