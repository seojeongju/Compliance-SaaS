"use client";

import { useState } from "react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const supabase = createSupabaseClient();

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage("가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            setError(error.message || "오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-zinc-900">
                        {mode === "signin" ? "로그인" : "회원가입"}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        {mode === "signin"
                            ? "서비스 이용을 위해 로그인해주세요."
                            : "계정을 생성하여 서비스를 시작하세요."}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-zinc-300 pl-10 px-3 py-3 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-all"
                                placeholder="이메일 주소"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-zinc-300 pl-10 px-3 py-3 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-all"
                                placeholder="비밀번호"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "signin" ? "로그인하기" : "가입하기"}
                    </button>

                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                        >
                            {mode === "signin"
                                ? "계정이 없으신가요? 회원가입"
                                : "이미 계정이 있으신가요? 로그인"}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
