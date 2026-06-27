import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { verifyPassword } from "@/lib/password";
import { buildSessionCookie, createSession } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as { email?: string; password?: string };

        if (!email || !password) {
            return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
        }

        const db = requireDb();
        const user = await db
            .prepare("SELECT id, password_hash, email_verified FROM users WHERE email = ?")
            .bind(email.toLowerCase())
            .first<{ id: string; password_hash: string; email_verified: number }>();

        if (!user || !(await verifyPassword(password, user.password_hash))) {
            return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
        }

        if (user.email_verified !== 1) {
            await db
                .prepare("UPDATE users SET email_verified = 1 WHERE id = ?")
                .bind(user.id)
                .run();
        }

        const session = await createSession(db, user.id);
        const response = NextResponse.json({
            user: { id: user.id, email: email.toLowerCase(), emailVerified: true },
        });
        response.headers.set("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
    }
}
