import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { createAuthToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { email } = (await req.json()) as { email?: string };
        if (!email) {
            return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
        }

        const db = requireDb();
        const user = await db
            .prepare("SELECT id FROM users WHERE email = ?")
            .bind(email.toLowerCase())
            .first<{ id: string }>();

        if (user) {
            const token = await createAuthToken(db, user.id, "password_reset", 24);
            await sendPasswordResetEmail(email, token);
        }

        return NextResponse.json({
            message: "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
