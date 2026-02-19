"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "../../../lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("로그인 처리 중입니다...");

    useEffect(() => {
        handleAuthCallback();
    }, []);

    const handleAuthCallback = async () => {
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/dashboard';

        if (code) {
            const supabase = createSupabaseClient();
            try {
                // Exchange code for session using PKCE flow
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
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
            // Implicit flow or just redirected
            // Check if user is already logged in
            const supabase = createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                router.push(next);
            } else {
                setMessage("유효하지 않은 링크입니다.");
                setTimeout(() => router.push('/login'), 2000);
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-zinc-600 font-medium">{message}</p>
        </div>
    );
}
