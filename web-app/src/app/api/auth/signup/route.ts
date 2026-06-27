import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { hashPassword } from "@/lib/password";
import { createAuthToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

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

        const db = requireDb();
        const existing = await db
            .prepare("SELECT id FROM users WHERE email = ?")
            .bind(email.toLowerCase())
            .first();

        if (existing) {
            return NextResponse.json({ error: "이미 등록된 이메일입니다." }, { status: 409 });
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);

        await db.batch([
            db
                .prepare(
                    "INSERT INTO users (id, email, password_hash, email_verified) VALUES (?, ?, ?, 0)"
                )
                .bind(userId, email.toLowerCase(), passwordHash),
            db
                .prepare(
                    "INSERT INTO profiles (id, email, role, tier) VALUES (?, ?, 'user', 'free')"
                )
                .bind(userId, email.toLowerCase()),
        ]);

        const verifyToken = await createAuthToken(db, userId, "email_verify", 48);
        await sendVerificationEmail(email, verifyToken);

        return NextResponse.json({
            message: "가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }
}
