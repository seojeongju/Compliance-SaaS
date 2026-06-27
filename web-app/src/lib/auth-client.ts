"use client";

export interface SessionUser {
    id: string;
    email: string;
    emailVerified: boolean;
    role: "admin" | "user";
    tier: "free" | "pro";
}

type ApiMessage = { error?: string; message?: string };

async function authFetch(path: string, init?: RequestInit) {
    return fetch(path, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });
}

export async function getSession(): Promise<SessionUser | null> {
    const res = await authFetch("/api/auth/session");
    if (!res.ok) return null;
    const data = (await res.json()) as { user: SessionUser | null };
    return data.user;
}

export async function signUp(
    email: string,
    password: string
): Promise<{ error?: string; message?: string; user?: SessionUser }> {
    const res = await authFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as ApiMessage & { user?: SessionUser };
    if (!res.ok) return { error: data.error || "회원가입에 실패했습니다." };
    return { message: data.message, user: data.user };
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
    const res = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as ApiMessage;
    if (!res.ok) return { error: data.error || "로그인에 실패했습니다." };
    return {};
}

export async function signOut(): Promise<void> {
    await authFetch("/api/auth/logout", { method: "POST" });
}

export async function forgotPassword(email: string): Promise<{ error?: string; message?: string }> {
    const res = await authFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as ApiMessage;
    if (!res.ok) return { error: data.error || "요청에 실패했습니다." };
    return { message: data.message };
}

export async function resetPassword(token: string, password: string): Promise<{ error?: string; message?: string }> {
    const res = await authFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
    });
    const data = (await res.json()) as ApiMessage;
    if (!res.ok) return { error: data.error || "비밀번호 변경에 실패했습니다." };
    return { message: data.message };
}

export async function verifyEmailToken(token: string): Promise<{ error?: string }> {
    const res = await authFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    const data = (await res.json()) as ApiMessage;
    if (!res.ok) return { error: data.error || "인증에 실패했습니다." };
    return {};
}

export async function apiFetch(path: string, init?: RequestInit) {
    return authFetch(path, init);
}
