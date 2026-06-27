import { getEnv } from "./cloudflare";
import { hashToken } from "./password";

export const SESSION_COOKIE = "cm_session";
const SESSION_DAYS = 30;

export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    role: "admin" | "user";
    tier: "free" | "pro";
}

export function createSessionToken(): string {
    return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
}

export function sessionExpiry(): string {
    const d = new Date();
    d.setDate(d.getDate() + SESSION_DAYS);
    return d.toISOString();
}

export function tokenExpiry(hours: number): string {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d.toISOString();
}

export function parseCookies(header: string | null): Record<string, string> {
    if (!header) return {};
    return Object.fromEntries(
        header.split(";").map((part) => {
            const [key, ...rest] = part.trim().split("=");
            return [key, decodeURIComponent(rest.join("="))];
        })
    );
}

export function buildSessionCookie(token: string, expiresAt: string): string {
    const expires = new Date(expiresAt).toUTCString();
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}${secure}`;
}

export function clearSessionCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function getSessionTokenFromRequest(req: Request): Promise<string | null> {
    const cookies = parseCookies(req.headers.get("cookie"));
    if (cookies[SESSION_COOKIE]) return cookies[SESSION_COOKIE];

    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
        return auth.slice(7);
    }
    return null;
}

export async function getUserFromRequest(
    req: Request,
    db: D1Database
): Promise<AuthUser | null> {
    const token = await getSessionTokenFromRequest(req);
    if (!token) return null;

    const tokenHash = await hashToken(token);
    const row = await db
        .prepare(
            `SELECT u.id, u.email, u.email_verified, p.role, p.tier, s.expires_at
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             JOIN profiles p ON p.id = u.id
             WHERE s.token_hash = ?`
        )
        .bind(tokenHash)
        .first<{
            id: string;
            email: string;
            email_verified: number;
            role: "admin" | "user";
            tier: "free" | "pro";
            expires_at: string;
        }>();

    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) return null;

    return {
        id: row.id,
        email: row.email,
        emailVerified: row.email_verified === 1,
        role: row.role,
        tier: row.tier,
    };
}

export async function createSession(
    db: D1Database,
    userId: string
): Promise<{ token: string; expiresAt: string }> {
    const token = createSessionToken();
    const tokenHash = await hashToken(token);
    const expiresAt = sessionExpiry();
    const id = crypto.randomUUID();

    await db
        .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
        .bind(id, userId, tokenHash, expiresAt)
        .run();

    return { token, expiresAt };
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
    const tokenHash = await hashToken(token);
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export async function createAuthToken(
    db: D1Database,
    userId: string,
    type: "email_verify" | "password_reset",
    hours = 24
): Promise<string> {
    const token = createSessionToken();
    const tokenHash = await hashToken(token);
    const expiresAt = tokenExpiry(hours);
    await db
        .prepare(
            "INSERT INTO auth_tokens (id, user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(crypto.randomUUID(), userId, tokenHash, type, expiresAt)
        .run();
    return token;
}

export async function consumeAuthToken(
    db: D1Database,
    token: string,
    type: "email_verify" | "password_reset"
): Promise<string | null> {
    const tokenHash = await hashToken(token);
    const row = await db
        .prepare(
            "SELECT id, user_id, expires_at, used FROM auth_tokens WHERE token_hash = ? AND type = ?"
        )
        .bind(tokenHash, type)
        .first<{ id: string; user_id: string; expires_at: string; used: number }>();

    if (!row || row.used === 1 || new Date(row.expires_at) < new Date()) {
        return null;
    }

    await db.prepare("UPDATE auth_tokens SET used = 1 WHERE id = ?").bind(row.id).run();
    return row.user_id;
}
