import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { hashPassword } from "@/lib/password";
import { buildSessionCookie, createSession } from "@/lib/auth";
import { isEmailDeliveryConfigured, sendWelcomeEmail } from "@/lib/email";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as { email?: string; password?: string };

        if (!email || !password) {
            return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();
        const db = requireDb();
        const existing = await db
            .prepare("SELECT id FROM users WHERE email = ?")
            .bind(normalizedEmail)
            .first();

        if (existing) {
            return NextResponse.json({ error: "이미 등록된 이메일입니다." }, { status: 409 });
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);

        await db.batch([
            db
                .prepare(
                    "INSERT INTO users (id, email, password_hash, email_verified) VALUES (?, ?, ?, 1)"
                )
                .bind(userId, normalizedEmail, passwordHash),
            db
                .prepare(
                    "INSERT INTO profiles (id, email, role, tier) VALUES (?, ?, 'user', 'free')"
                )
                .bind(userId, normalizedEmail),
        ]);

        const session = await createSession(db, userId);

        if (isEmailDeliveryConfigured()) {
            void sendWelcomeEmail(normalizedEmail).catch((error) => {
                console.error("Welcome email failed:", error);
            });
        }

        const response = NextResponse.json({
            user: { id: userId, email: normalizedEmail, emailVerified: true },
            message: "회원가입이 완료되었습니다.",
        });
        response.headers.set("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }
}
