import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: null });
    }
}
