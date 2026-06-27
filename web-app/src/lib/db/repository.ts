import { requireDb } from "../cloudflare";
import { getDocumentContent, documentR2Key, putDocumentContent, deleteDocumentContent } from "../r2";

export interface DiagnosticRow {
    id: string;
    user_id: string | null;
    product_name: string;
    category: string;
    description: string | null;
    result_json: string;
    tool_type: string | null;
    created_at: string;
}

export interface DocumentRow {
    id: string;
    user_id: string | null;
    diagnostic_id: string | null;
    title: string;
    doc_type: string;
    content: string | null;
    r2_key: string | null;
    status: string;
    created_at: string;
}

export async function insertDiagnostic(input: {
    userId?: string | null;
    productName: string;
    category: string;
    description?: string | null;
    resultJson: unknown;
    toolType?: string | null;
}): Promise<string> {
    const db = requireDb();
    const id = crypto.randomUUID();
    await db
        .prepare(
            `INSERT INTO diagnostic_results
             (id, user_id, product_name, category, description, result_json, tool_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            id,
            input.userId ?? null,
            input.productName,
            input.category,
            input.description ?? null,
            JSON.stringify(input.resultJson),
            input.toolType ?? null
        )
        .run();
    return id;
}

export async function listDiagnostics(
    userId: string,
    options?: { limit?: number; toolType?: string | null }
): Promise<DiagnosticRow[]> {
    const db = requireDb();
    const limit = options?.limit ?? 100;
    let query = `SELECT * FROM diagnostic_results WHERE user_id = ?`;
    const binds: unknown[] = [userId];

    if (options?.toolType === null) {
        query += ` AND tool_type IS NULL`;
    } else if (options?.toolType) {
        query += ` AND tool_type = ?`;
        binds.push(options.toolType);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    binds.push(limit);

    const { results } = await db.prepare(query).bind(...binds).all<DiagnosticRow>();
    return results ?? [];
}

export async function deleteDiagnostic(id: string, userId?: string | null): Promise<boolean> {
    const db = requireDb();
    if (userId) {
        const res = await db
            .prepare("DELETE FROM diagnostic_results WHERE id = ? AND user_id = ?")
            .bind(id, userId)
            .run();
        return (res.meta.changes ?? 0) > 0;
    }
    const res = await db.prepare("DELETE FROM diagnostic_results WHERE id = ?").bind(id).run();
    return (res.meta.changes ?? 0) > 0;
}

export async function countDiagnostics(userId: string): Promise<number> {
    const db = requireDb();
    const row = await db
        .prepare("SELECT COUNT(*) as count FROM diagnostic_results WHERE user_id = ?")
        .bind(userId)
        .first<{ count: number }>();
    return row?.count ?? 0;
}

export async function getCertificationCost(
    userId: string,
    productName: string
): Promise<string | null> {
    const db = requireDb();
    const row = await db
        .prepare(
            `SELECT result_json FROM diagnostic_results
             WHERE user_id = ? AND tool_type IS NULL
             AND LOWER(product_name) LIKE LOWER(?)
             ORDER BY created_at DESC LIMIT 1`
        )
        .bind(userId, `%${productName}%`)
        .first<{ result_json: string }>();

    if (!row?.result_json) return null;
    try {
        const parsed = JSON.parse(row.result_json) as { estimated_cost?: string };
        return parsed.estimated_cost ?? null;
    } catch {
        return null;
    }
}

export async function insertDocument(input: {
    userId?: string | null;
    diagnosticId?: string | null;
    title: string;
    docType: string;
    content: string;
    status?: string;
}): Promise<string> {
    const db = requireDb();
    const id = crypto.randomUUID();
    const r2Key = documentR2Key(input.userId ?? null, id);
    const storedInR2 = await putDocumentContent(r2Key, input.content);

    await db
        .prepare(
            `INSERT INTO documents
             (id, user_id, diagnostic_id, title, doc_type, content, r2_key, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            id,
            input.userId ?? null,
            input.diagnosticId ?? null,
            input.title,
            input.docType,
            storedInR2 ? null : input.content,
            storedInR2 ? r2Key : null,
            input.status ?? "draft"
        )
        .run();
    return id;
}

export async function listDocuments(userId: string): Promise<DocumentRow[]> {
    const db = requireDb();
    const { results } = await db
        .prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC")
        .bind(userId)
        .all<DocumentRow>();
    return results ?? [];
}

export async function resolveDocumentContent(doc: DocumentRow): Promise<string> {
    if (doc.content) return doc.content;
    if (doc.r2_key) {
        const content = await getDocumentContent(doc.r2_key);
        return content ?? "";
    }
    return "";
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
    const db = requireDb();
    const doc = await db
        .prepare("SELECT r2_key FROM documents WHERE id = ? AND user_id = ?")
        .bind(id, userId)
        .first<{ r2_key: string | null }>();

    if (!doc) return false;
    if (doc.r2_key) await deleteDocumentContent(doc.r2_key);

    const res = await db
        .prepare("DELETE FROM documents WHERE id = ? AND user_id = ?")
        .bind(id, userId)
        .run();
    return (res.meta.changes ?? 0) > 0;
}

export async function countDocuments(userId: string): Promise<number> {
    const db = requireDb();
    const row = await db
        .prepare("SELECT COUNT(*) as count FROM documents WHERE user_id = ?")
        .bind(userId)
        .first<{ count: number }>();
    return row?.count ?? 0;
}

export async function listProfiles(): Promise<
    Array<{
        id: string;
        email: string | null;
        role: string;
        tier: string;
        created_at: string;
    }>
> {
    const db = requireDb();
    const { results } = await db
        .prepare("SELECT id, email, role, tier, created_at FROM profiles ORDER BY created_at DESC")
        .all();
    return (results ?? []) as Array<{
        id: string;
        email: string | null;
        role: string;
        tier: string;
        created_at: string;
    }>;
}

export async function updateProfileTier(userId: string, tier: "free" | "pro"): Promise<void> {
    const db = requireDb();
    await db.prepare("UPDATE profiles SET tier = ? WHERE id = ?").bind(tier, userId).run();
}

export async function updateProfileRole(userId: string, role: "admin" | "user"): Promise<void> {
    const db = requireDb();
    await db.prepare("UPDATE profiles SET role = ? WHERE id = ?").bind(role, userId).run();
}

export async function listDiagnosticsAdmin(page: number, perPage: number) {
    const db = requireDb();
    const offset = (page - 1) * perPage;
    const countRow = await db
        .prepare("SELECT COUNT(*) as count FROM diagnostic_results")
        .first<{ count: number }>();

    const { results } = await db
        .prepare(
            `SELECT id, product_name, created_at, user_id
             FROM diagnostic_results ORDER BY created_at DESC LIMIT ? OFFSET ?`
        )
        .bind(perPage, offset)
        .all();

    return { rows: results ?? [], total: countRow?.count ?? 0 };
}

export async function countAllDiagnostics(): Promise<number> {
    const db = requireDb();
    const row = await db
        .prepare("SELECT COUNT(*) as count FROM diagnostic_results")
        .first<{ count: number }>();
    return row?.count ?? 0;
}

export async function countProUsers(): Promise<number> {
    const db = requireDb();
    const row = await db
        .prepare("SELECT COUNT(*) as count FROM profiles WHERE tier = 'pro'")
        .first<{ count: number }>();
    return row?.count ?? 0;
}

export async function countUsers(): Promise<number> {
    const db = requireDb();
    const row = await db.prepare("SELECT COUNT(*) as count FROM profiles").first<{ count: number }>();
    return row?.count ?? 0;
}

export async function getProfile(userId: string) {
    const db = requireDb();
    return db
        .prepare("SELECT id, email, role, tier, full_name, company_name FROM profiles WHERE id = ?")
        .bind(userId)
        .first();
}
