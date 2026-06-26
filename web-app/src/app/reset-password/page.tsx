"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle, ShieldCheck, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // 비밀번호 재설정 페이지는 사용자가 이미 이메일 링크를 통해
        // 인증 세션을 수립한 상태(로그인 상태)여야 작동합니다.
        const checkSession = async () => {
            const supabase = createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setHasSession(false);
                setError("유효하지 않거나 만료된 요청입니다. 비밀번호 재설정 이메일을 다시 요청해주세요.");
            } else {
                setHasSession(true);
            }
        };
        checkSession();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password.length < 6) {
            setError("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        const supabase = createSupabaseClient();

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setMessage("비밀번호가 성공적으로 변경되었습니다. 잠시 후 대시보드로 이동합니다.");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (error: any) {
            console.error("Reset Password Error:", error);
            setError(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-2 lg:bg-zinc-50">
            {/* Left Side: Visual & Branding */}
            <div className="hidden lg:relative lg:flex lg:flex-col lg:justify-between lg:bg-zinc-900 lg:p-12 lg:text-white overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-zinc-900 opacity-90 z-0"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 z-0"></div>

                {/* Blur Orbs */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600 blur-[128px] opacity-40 animate-pulse z-0"></div>
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600 blur-[128px] opacity-30 z-0"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white hover:opacity-80 transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-2xl font-bold font-sans">Certi-Mate</span>
                            <span className="text-xs font-medium text-zinc-400">(주)와우쓰리디</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md space-y-8">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed text-zinc-100">
                            "보안과 규제 준수는 비즈니스의 기본입니다. Certi-Mate와 함께 안전하게 시작하세요."
                        </p>
                        <footer className="text-sm font-medium text-zinc-400">
                            — Certi-Mate 보안 팀
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px] space-y-8"
                >
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tighter text-zinc-900">
                            비밀번호 재설정
                        </h1>
                        <p className="text-zinc-500">
                            새롭게 사용할 안전한 비밀번호를 입력해주세요.
                        </p>
                    </div>

                    {hasSession === false ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-2 rounded-md bg-red-50 p-4 text-sm text-red-600">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">세션 오류</p>
                                    <p className="text-xs text-red-500 mt-1">{error}</p>
                                </div>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-800"
                            >
                                로그인 페이지로 돌아가기
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="password">
                                        새 비밀번호
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all hover:border-zinc-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                                        새 비밀번호 확인
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all hover:border-zinc-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </motion.div>
                                )}
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600"
                                    >
                                        <Check className="h-4 w-4" />
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                비밀번호 설정하기 <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>

            <div className="lg:hidden absolute top-4 left-4 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 p-2 bg-white/80 rounded-lg backdrop-blur shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-xl font-bold">Certi-Mate</span>
                        <span className="text-[10px] font-medium text-zinc-500">(주)와우쓰리디</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
