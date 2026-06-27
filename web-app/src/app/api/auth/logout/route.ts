import { NextResponse } from "next/server";
import { getDb } from "@/lib/cloudflare";
import { clearSessionCookie, deleteSession, getSessionTokenFromRequest } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
    const db = getDb();
    const token = await getSessionTokenFromRequest(req);

    if (db && token) {
        await deleteSession(db, token);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
}
