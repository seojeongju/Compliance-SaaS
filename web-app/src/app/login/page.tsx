"use client";

import { useState } from "react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck, Check, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
            setError(error.message || "오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === "signin" ? "signup" : "signin");
        setError(null);
        setMessage(null);
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
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <span>Certi-Mate</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md space-y-8">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed text-zinc-100">
                            "Certi-Mate 덕분에 복잡한 인증 절차를 3개월이나 단축했습니다. 이제 제품 개발에만 집중할 수 있어요."
                        </p>
                        <footer className="text-sm font-medium text-zinc-400">
                            — 김민수, 테크 스타트업 CEO
                        </footer>
                    </blockquote>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-700"></div>
                            ))}
                        </div>
                        <span>+ 1,200명의 창업자가 함께합니다.</span>
                    </div>
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
                            {mode === "signin" ? "환영합니다!" : "계정을 생성하세요"}
                        </h1>
                        <p className="text-zinc-500">
                            {mode === "signin"
                                ? "이메일과 비밀번호를 입력하여 로그인하세요."
                                : "서비스 이용을 위한 기본 정보를 입력해주세요."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                    이메일
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-zinc-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                        비밀번호
                                    </label>
                                    {mode === "signin" && (
                                        <Link href="#" className="text-xs font-medium text-blue-600 hover:underline">
                                            비밀번호 찾기
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-zinc-400"
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
                            {mode === "signin" ? "로그인" : "계정 만들기"} <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button disabled className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors opacity-50 cursor-not-allowed">
                            <Github className="mr-2 h-4 w-4" /> GitHub
                        </button>
                        <button disabled className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors opacity-50 cursor-not-allowed">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.373-1.133 8.573-3.293 2.253-2.253 3.12-5.747 2.76-8.987l-11.333.2z"></path>
                            </svg> Google
                        </button>
                    </div>

                    <p className="px-8 text-center text-sm text-zinc-500">
                        {mode === "signin" ? (
                            <>
                                계정이 없으신가요?{" "}
                                <button onClick={toggleMode} className="font-semibold text-zinc-900 hover:underline underline-offset-4 decoration-blue-500 decoration-2">
                                    회원가입
                                </button>
                            </>
                        ) : (
                            <>
                                이미 계정이 있으신가요?{" "}
                                <button onClick={toggleMode} className="font-semibold text-zinc-900 hover:underline underline-offset-4 decoration-blue-500 decoration-2">
                                    로그인
                                </button>
                            </>
                        )}
                    </p>
                </motion.div>
            </div>

            <div className="lg:hidden absolute top-4 left-4 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 p-2 bg-white/80 rounded-lg backdrop-blur">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    <span>Certi-Mate</span>
                </Link>
            </div>
        </div>
    );
}
