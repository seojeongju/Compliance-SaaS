import { NextResponse } from "next/server";
import { syncAllSubsidyPrograms } from "@/lib/subsidy-sync";

export const runtime = "nodejs";
export const maxDuration = 60;

function verifyCronAuth(req: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    const authHeader = req.headers.get("authorization");
    return authHeader === `Bearer ${secret}`;
}

export async function POST(req: Request) {
    if (!verifyCronAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await syncAllSubsidyPrograms();
        return NextResponse.json({
            success: true,
            ...result,
            synced_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Subsidy sync error:", error);
        return NextResponse.json(
            { error: "동기화 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    return POST(req);
}
