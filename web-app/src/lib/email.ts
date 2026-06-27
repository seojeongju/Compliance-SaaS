import { getEnv } from "./cloudflare";

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
    const env = getEnv();
    const fromEmail = env?.EMAIL_FROM || process.env.EMAIL_FROM || "noreply@example.com";
    const fromName = env?.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || "Certi-Mate";

    if (env?.EMAIL) {
        try {
            await env.EMAIL.send({
                to: options.to,
                from: { email: fromEmail, name: fromName },
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            return true;
        } catch (error) {
            console.error("Email binding send failed:", error);
        }
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (accountId && apiToken) {
        try {
            const res = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: [{ address: options.to }],
                        from: { address: fromEmail, name: fromName },
                        subject: options.subject,
                        html: options.html,
                        text: options.text,
                    }),
                }
            );
            if (res.ok) return true;
            console.error("Email REST API failed:", await res.text());
        } catch (error) {
            console.error("Email REST API error:", error);
        }
    }

    if (process.env.NODE_ENV !== "production") {
        console.log("[dev email]", options.to, options.subject, options.text);
        return true;
    }

    return false;
}

export function appUrl(path: string): string {
    const base =
        getEnv()?.APP_URL ||
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
    return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const link = appUrl(`/auth/callback?token=${encodeURIComponent(token)}&type=verify`);
    return sendEmail({
        to,
        subject: "[Certi-Mate] 이메일 인증을 완료해주세요",
        text: `Certi-Mate 가입을 환영합니다. 아래 링크를 클릭해 이메일 인증을 완료하세요.\n\n${link}`,
        html: `<p>Certi-Mate 가입을 환영합니다.</p><p><a href="${link}">이메일 인증하기</a></p>`,
    });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const link = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
    return sendEmail({
        to,
        subject: "[Certi-Mate] 비밀번호 재설정",
        text: `비밀번호 재설정 링크입니다.\n\n${link}\n\n24시간 내에 사용해주세요.`,
        html: `<p>비밀번호 재설정 링크입니다.</p><p><a href="${link}">비밀번호 재설정</a></p>`,
    });
}
