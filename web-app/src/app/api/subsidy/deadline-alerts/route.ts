import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import { listDeadlineAlerts } from "@/lib/db/subsidy-db";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
        }

        const alerts = await listDeadlineAlerts(user.id);
        return NextResponse.json({ alerts });
    } catch (error) {
        console.error("Deadline alerts error:", error);
        return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
}
