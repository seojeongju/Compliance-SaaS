import { requireDb } from "../cloudflare";
import {
    candidateToDbRow,
    rowToCandidate,
    type SubsidyProgramCandidate,
    type SubsidyProgramRow,
} from "../subsidy-program";

export async function searchProgramsFromDbD1(
    limit = 50
): Promise<SubsidyProgramCandidate[]> {
    const db = requireDb();
    const { results } = await db
        .prepare(
            `SELECT * FROM subsidy_programs
             WHERE status IN ('open', 'closing_soon')
             ORDER BY synced_at DESC LIMIT 200`
        )
        .all<SubsidyProgramRow & { hashtags: string }>();

    if (!results) return [];

    return results.slice(0, limit).map((row) => {
        const dbRow = row as SubsidyProgramRow & { hashtags: string; raw_json?: string | null };
        return rowToCandidate({
            ...dbRow,
            hashtags: JSON.parse(dbRow.hashtags || "[]") as string[],
            raw_json: dbRow.raw_json ? JSON.parse(dbRow.raw_json) : null,
        } as SubsidyProgramRow);
    });
}

export async function upsertProgramsD1(programs: SubsidyProgramCandidate[]): Promise<number> {
    const db = requireDb();
    if (programs.length === 0) return 0;

    const statements = programs.map((program) => {
        const row = candidateToDbRow(program);
        const id = crypto.randomUUID();
        return db
            .prepare(
                `INSERT INTO subsidy_programs
                 (id, external_id, source, title, agency, category, description, target,
                  application_period, deadline_date, official_url, application_url, hashtags,
                  status, raw_json, synced_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                 ON CONFLICT(source, external_id) DO UPDATE SET
                   title = excluded.title,
                   agency = excluded.agency,
                   category = excluded.category,
                   description = excluded.description,
                   target = excluded.target,
                   application_period = excluded.application_period,
                   deadline_date = excluded.deadline_date,
                   official_url = excluded.official_url,
                   application_url = excluded.application_url,
                   hashtags = excluded.hashtags,
                   status = excluded.status,
                   raw_json = excluded.raw_json,
                   synced_at = datetime('now')`
            )
            .bind(
                id,
                row.external_id,
                row.source,
                row.title,
                row.agency,
                row.category,
                row.description,
                row.target,
                row.application_period,
                row.deadline_date,
                row.official_url,
                row.application_url,
                JSON.stringify(row.hashtags ?? []),
                row.status,
                row.raw_json ? JSON.stringify(row.raw_json) : null
            );
    });

    await db.batch(statements);
    return programs.length;
}

export async function insertSyncLog(input: {
    source: string;
    syncedCount: number;
    errorMessage?: string | null;
}): Promise<void> {
    const db = requireDb();
    await db
        .prepare(
            `INSERT INTO subsidy_sync_logs (id, source, synced_count, error_message, finished_at)
             VALUES (?, ?, ?, ?, datetime('now'))`
        )
        .bind(
            crypto.randomUUID(),
            input.source,
            input.syncedCount,
            input.errorMessage ?? null
        )
        .run();
}

export async function listBookmarks(userId: string) {
    const db = requireDb();
    const { results } = await db
        .prepare(
            "SELECT * FROM subsidy_bookmarks WHERE user_id = ? ORDER BY bookmarked_at DESC"
        )
        .bind(userId)
        .all();
    return results ?? [];
}

export async function upsertBookmark(
    userId: string,
    input: {
        announcement_id: string;
        source: string;
        title: string;
        official_url?: string | null;
        deadline?: string | null;
        deadline_status?: string;
    }
) {
    const db = requireDb();
    const id = crypto.randomUUID();
    await db
        .prepare(
            `INSERT INTO subsidy_bookmarks
             (id, user_id, announcement_id, source, title, official_url, deadline, deadline_status, remind_deadline)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
             ON CONFLICT(user_id, source, announcement_id) DO UPDATE SET
               title = excluded.title,
               official_url = excluded.official_url,
               deadline = excluded.deadline,
               deadline_status = excluded.deadline_status,
               bookmarked_at = datetime('now')`
        )
        .bind(
            id,
            userId,
            input.announcement_id,
            input.source,
            input.title,
            input.official_url ?? null,
            input.deadline ?? null,
            input.deadline_status ?? "unknown"
        )
        .run();

    return db
        .prepare(
            "SELECT * FROM subsidy_bookmarks WHERE user_id = ? AND source = ? AND announcement_id = ?"
        )
        .bind(userId, input.source, input.announcement_id)
        .first();
}

export async function deleteBookmark(
    userId: string,
    announcementId: string,
    source: string
): Promise<void> {
    const db = requireDb();
    await db
        .prepare(
            "DELETE FROM subsidy_bookmarks WHERE user_id = ? AND announcement_id = ? AND source = ?"
        )
        .bind(userId, announcementId, source)
        .run();
}

export async function listDeadlineAlerts(userId: string) {
    const db = requireDb();
    const { results } = await db
        .prepare(
            `SELECT * FROM subsidy_bookmarks
             WHERE user_id = ? AND remind_deadline = 1
             AND deadline_status IN ('closing_soon', 'open')
             ORDER BY bookmarked_at DESC`
        )
        .bind(userId)
        .all();
    return results ?? [];
}
