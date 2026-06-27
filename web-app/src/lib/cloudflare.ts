import { getRequestContext } from "@cloudflare/next-on-pages";
import type { CloudflareEnv } from "@/types/cloudflare-env";

export function getEnv(): CloudflareEnv | null {
    try {
        return getRequestContext().env as CloudflareEnv;
    } catch {
        return globalThis.__CF_ENV__ ?? null;
    }
}

export function getDb(): D1Database | null {
    return getEnv()?.DB ?? null;
}

export function getStorage(): R2Bucket | null {
    return getEnv()?.STORAGE ?? null;
}

export function requireDb(): D1Database {
    const db = getDb();
    if (!db) {
        throw new Error("D1 database binding (DB) is not available");
    }
    return db;
}
