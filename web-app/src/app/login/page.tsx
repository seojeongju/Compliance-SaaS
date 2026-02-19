"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                        <ShieldCheck className="h-8 w-8" />
                        <span>Certi-Mate</span>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-600">
                        또는{" "}
                        <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                            무료 회원가입
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                이메일 주소
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="이메일 주소"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="비밀번호"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                                ) : (
                                    <ShieldCheck className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                )}
                            </span>
                            {isLoading ? "로그인 중..." : "로그인"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
