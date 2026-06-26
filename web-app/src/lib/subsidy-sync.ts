import { fetchBizinfoPrograms } from "./bizinfo";
import { fetchKStartupPrograms } from "./kstartup";
import { createSupabaseAdmin } from "./supabaseAdmin";
import {
    type SubsidyProgramCandidate,
} from "./subsidy-program";
import { upsertPrograms } from "./subsidy-repository";

export interface SyncResult {
    bizinfo: { synced: number; error?: string };
    kstartup: { synced: number; error?: string };
    total: number;
}

async function syncSource(
    source: "bizinfo" | "kstartup",
    fetcher: () => Promise<{ programs: SubsidyProgramCandidate[]; error?: string }>
): Promise<{ synced: number; error?: string; programs: SubsidyProgramCandidate[] }> {
    const { programs, error } = await fetcher();

    if (programs.length === 0) {
        return { synced: 0, error, programs: [] };
    }

    try {
        const synced = await upsertPrograms(programs);
        return { synced, error, programs };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Upsert failed";
        return { synced: 0, error: message, programs: [] };
    }
}

export async function syncAllSubsidyPrograms(): Promise<SyncResult> {
    const admin = createSupabaseAdmin();

    const bizinfoResult = await syncSource("bizinfo", () =>
        fetchBizinfoPrograms({ searchCount: 100 })
    );

    const kstartupResult = await syncSource("kstartup", () =>
        fetchKStartupPrograms(1, 100)
    );

    if (admin) {
        await admin.from("subsidy_sync_logs").insert({
            source: "all",
            synced_count: bizinfoResult.synced + kstartupResult.synced,
            error_message: [bizinfoResult.error, kstartupResult.error].filter(Boolean).join("; ") || null,
            finished_at: new Date().toISOString(),
        });
    }

    return {
        bizinfo: { synced: bizinfoResult.synced, error: bizinfoResult.error },
        kstartup: { synced: kstartupResult.synced, error: kstartupResult.error },
        total: bizinfoResult.synced + kstartupResult.synced,
    };
}
