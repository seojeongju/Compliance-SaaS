import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import { getProfile } from "@/lib/db/repository";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ profile: null });
        }

        const profile = await getProfile(user.id);
        return NextResponse.json({ profile, user });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ profile: null, user: null });
    }
}
