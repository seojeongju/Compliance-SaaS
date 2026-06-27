import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { buildSessionCookie, consumeAuthToken, createSession } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
        return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
    }

    try {
        const db = requireDb();
        const userId = await consumeAuthToken(db, token, "email_verify");
        if (!userId) {
            return NextResponse.json({ error: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
        }

        await db
            .prepare("UPDATE users SET email_verified = 1 WHERE id = ?")
            .bind(userId)
            .run();

        const session = await createSession(db, userId);
        const response = NextResponse.json({ success: true });
        response.headers.set("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
        return response;
    } catch (error) {
        console.error("Verify email error:", error);
        return NextResponse.json({ error: "이메일 인증 중 오류가 발생했습니다." }, { status: 500 });
    }
}
