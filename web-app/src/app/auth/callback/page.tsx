"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailToken } from "../../../lib/auth-client";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("로그인 처리 중입니다...");

    useEffect(() => {
        handleAuthCallback();
    }, []);

    const handleAuthCallback = async () => {
        const token = searchParams.get('token');
        const next = searchParams.get('next') ?? '/dashboard';

        if (token) {
            try {
                const result = await verifyEmailToken(token);
                if (result.error) {
                    setMessage("인증 오류가 발생했습니다. 다시 로그인해주세요.");
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setMessage("환영합니다! 대시보드로 이동합니다.");
                    router.push(next);
                }
            } catch (err) {
                console.error("Auth Callback Error:", err);
                setMessage("오류가 발생했습니다.");
                setTimeout(() => router.push('/login'), 2000);
            }
        } else {
            setMessage("유효하지 않은 링크입니다.");
            setTimeout(() => router.push('/login'), 2000);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-zinc-600 font-medium">{message}</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
