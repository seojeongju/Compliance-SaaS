import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import {
    countAllDiagnostics,
    countProUsers,
    countUsers,
    listDiagnosticsAdmin,
    listProfiles,
    updateProfileRole,
    updateProfileTier,
} from "@/lib/db/repository";

export const runtime = "edge";

async function requireAdmin(req: Request) {
    const db = requireDb();
    const user = await getUserFromRequest(req, db);
    if (!user || user.role !== "admin") {
        return { error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
    }
    return { db, user };
}

export async function GET(req: Request) {
    const auth = await requireAdmin(req);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const resource = searchParams.get("resource") || "users";

    try {
        if (resource === "stats") {
            const [totalUsers, proUsers, totalDiagnostics] = await Promise.all([
                countUsers(),
                countProUsers(),
                countAllDiagnostics(),
            ]);
            return NextResponse.json({ totalUsers, proUsers, totalDiagnostics, activeToday: 0 });
        }

        if (resource === "logs") {
            const page = Number(searchParams.get("page") || "1");
            const { rows, total } = await listDiagnosticsAdmin(page, 5);
            return NextResponse.json({ logs: rows, total });
        }

        const users = await listProfiles();
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Admin GET error:", error);
        return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const auth = await requireAdmin(req);
    if ("error" in auth) return auth.error;

    try {
        const body = (await req.json()) as {
            userId?: string;
            tier?: "free" | "pro";
            role?: "admin" | "user";
        };
        const { userId, tier, role } = body as {
            userId?: string;
            tier?: "free" | "pro";
            role?: "admin" | "user";
        };

        if (!userId) {
            return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
        }

        if (tier) await updateProfileTier(userId, tier);
        if (role) await updateProfileRole(userId, role);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin PATCH error:", error);
        return NextResponse.json({ error: "수정 중 오류가 발생했습니다." }, { status: 500 });
    }
}
