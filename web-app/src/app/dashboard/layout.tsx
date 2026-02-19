"use client";

import Link from "next/link";
import { BarChart, FileText, Home, Settings, ShieldCheck, LogOut, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserEmail(user.email || "User");
        } else {
            setUserEmail(null);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        setUserEmail(null);
        router.refresh();
        router.push("/login");
    };

    const navItems = [
        { href: "/dashboard", icon: Home, label: "대시보드" },
        { href: "/dashboard/diagnostic", icon: BarChart, label: "규제 진단" },
        { href: "/dashboard/documents", icon: FileText, label: "내 문서함" },
        { href: "/dashboard/settings", icon: Settings, label: "설정" },
    ];

    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white flex flex-col">
                <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <ShieldCheck className="h-6 w-6" />
                        <span>Certi-Mate</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="border-t p-4 flex-shrink-0 bg-zinc-50/50">
                    {loading ? (
                        <div className="h-10 animate-pulse rounded bg-zinc-200" />
                    ) : userEmail ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="truncate text-sm font-medium text-zinc-900">
                                        {userEmail.split("@")[0]}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500" title={userEmail}>
                                        {userEmail}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                                title="로그아웃"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">Guest</p>
                                    <p className="text-xs text-zinc-500">비로그인 상태</p>
                                </div>
                            </div>
                            <Link
                                href="/login"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                            >
                                <LogIn className="h-4 w-4" />
                                로그인 / 가입
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
