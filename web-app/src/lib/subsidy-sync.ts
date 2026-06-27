import { fetchBizinfoPrograms } from "./bizinfo";
import { fetchKStartupPrograms } from "./kstartup";
import {
    type SubsidyProgramCandidate,
} from "./subsidy-program";
import { upsertProgramsD1, insertSyncLog } from "./db/subsidy-db";
import { getDb } from "./cloudflare";

export interface SyncResult {
    bizinfo: { synced: number; error?: string };
    kstartup: { synced: number; error?: string };
    total: number;
}

async function syncSource(
    fetcher: () => Promise<{ programs: SubsidyProgramCandidate[]; error?: string }>
): Promise<{ synced: number; error?: string; programs: SubsidyProgramCandidate[] }> {
    const { programs, error } = await fetcher();

    if (programs.length === 0) {
        return { synced: 0, error, programs: [] };
    }

    try {
        const synced = await upsertProgramsD1(programs);
        return { synced, error, programs };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Upsert failed";
        return { synced: 0, error: message, programs: [] };
    }
}

export async function syncAllSubsidyPrograms(): Promise<SyncResult> {
    const bizinfoResult = await syncSource(() =>
        fetchBizinfoPrograms({ searchCount: 100 })
    );

    const kstartupResult = await syncSource(() =>
        fetchKStartupPrograms(1, 100)
    );

    if (getDb()) {
        await insertSyncLog({
            source: "all",
            syncedCount: bizinfoResult.synced + kstartupResult.synced,
            errorMessage: [bizinfoResult.error, kstartupResult.error].filter(Boolean).join("; ") || null,
        });
    }

    return {
        bizinfo: { synced: bizinfoResult.synced, error: bizinfoResult.error },
        kstartup: { synced: kstartupResult.synced, error: kstartupResult.error },
        total: bizinfoResult.synced + kstartupResult.synced,
    };
}
