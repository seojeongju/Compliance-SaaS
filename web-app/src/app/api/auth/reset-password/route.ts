import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { hashPassword } from "@/lib/password";
import { buildSessionCookie, consumeAuthToken, createSession } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { token, password } = (await req.json()) as { token?: string; password?: string };

        if (!token || !password) {
            return NextResponse.json({ error: "토큰과 새 비밀번호가 필요합니다." }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
        }

        const db = requireDb();
        const userId = await consumeAuthToken(db, token, "password_reset");
        if (!userId) {
            return NextResponse.json({ error: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);
        await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, userId).run();

        const session = await createSession(db, userId);
        const response = NextResponse.json({
            message: "비밀번호가 성공적으로 변경되었습니다.",
        });
        response.headers.set("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
        return response;
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "비밀번호 변경 중 오류가 발생했습니다." }, { status: 500 });
    }
}
