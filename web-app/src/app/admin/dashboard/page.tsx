"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
    Users, Activity, DollarSign, Settings, Search, CheckCircle,
    User, Lock, Shield, ArrowUp, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

// --- Types ---
interface UserProfile {
    id: string;
    email: string;
    role: "admin" | "user";
    tier: "free" | "pro";
    created_at: string;
}

interface DiagnosticLog {
    id: string;
    product_name: string;
    created_at: string;
    user_email?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        proUsers: 0,
        totalDiagnostics: 0,
    });
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [logs, setLogs] = useState<DiagnosticLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/dashboard/login");
                return;
            }

            // Check if user is admin
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (error || profile?.role !== "admin") {
                // If profiles table doesn't exist or user is not admin
                // For Development Purpose: We might allow access if table is missing or just show error
                setError("관리자 권한이 필요합니다.");
                // In production, redirect immediately: router.push("/dashboard");
                // For now, let's load data anyway if it's local dev, BUT ideally we block
                // Let's assume strict mode:
                if (process.env.NODE_ENV === 'production') {
                    router.push("/dashboard");
                    return;
                }
            }

            setCurrentUser(user);
            fetchDashboardData();

        } catch (err) {
            console.error("Admin check error:", err);
            setError("관리자 확인 중 오류가 발생했습니다.");
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const supabase = createSupabaseClient();

            // 1. Fetch Users
            // Note: In real production with many users, use pagination
            const { data: usersData, error: usersError } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (usersError) throw usersError;

            // 2. Fetch Diagnostics Logs
            const { data: logsData, error: logsError } = await supabase
                .from("diagnostic_results")
                .select("id, product_name, created_at, user_id")
                .order("created_at", { ascending: false })
                .limit(10);

            if (logsError && logsError.code !== 'PGRST116') {
                // Ignore if table doesn't exist yet
                console.warn("Diagnostics table fetch error", logsError);
            }

            setUsers(usersData as UserProfile[] || []);
            setLogs(logsData as unknown as DiagnosticLog[] || []);

            // 3. Calculate Stats
            const totalUsers = usersData?.length || 0;
            const proUsers = usersData?.filter((u: any) => u.tier === 'pro').length || 0;

            // Mocking 'activeToday' for now
            const activeToday = Math.floor(Math.random() * 5) + 1;

            setStats({
                totalUsers,
                activeToday,
                proUsers,
                totalDiagnostics: logsData?.length || 0, // Should be count
            });

        } catch (err: any) {
            console.error("Dashboard data load error:", err);
            // setError("데이터 로드 실패: " + err.message);
            // Don't block UI if just data load fails (e.g., tables missing)
        } finally {
            setLoading(false);
        }
    };

    const toggleUserTier = async (userId: string, currentTier: string) => {
        const newTier = currentTier === 'free' ? 'pro' : 'free';
        if (!confirm(`사용자 등급을 ${newTier.toUpperCase()}로 변경하시겠습니까?`)) return;

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("profiles")
                .update({ tier: newTier })
                .eq("id", userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
            alert("사용자 등급이 변경되었습니다.");
        } catch (err) {
            console.error("Update error:", err);
            alert("등급 변경 실패");
        }
    };

    const updateUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        // Prevent changing own role for safety
        if (currentUser?.id === userId) {
            alert("자신의 관리자 권한은 스스로 해제할 수 없습니다.");
            return;
        }

        if (!confirm(`사용자 권한을 ${newRole.toUpperCase()}로 변경하시겠습니까?`)) return;

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as "admin" | "user" } : u));
            alert("사용자 권한이 변경되었습니다.");
        } catch (err) {
            console.error("Update error:", err);
            alert("권한 변경 실패");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
                    <p className="mt-2 text-sm text-zinc-500">관리자 데이터 로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="rounded-lg bg-white p-8 shadow-sm border border-zinc-200 text-center max-w-md">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">접근 권한 제한</h2>
                    <p className="text-zinc-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white font-medium hover:bg-zinc-800"
                    >
                        대시보드로 돌아가기
                    </button>
                    <div className="mt-4 text-xs text-zinc-400 bg-zinc-100 p-2 rounded">
                        * 개발 환경 팁: Supabase에 'profiles' 테이블을 생성하고 자신의 계정에 role='admin'을 설정하세요.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <h1 className="text-lg font-bold text-zinc-900">Admin Dashboard</h1>
                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">BETA</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500">{currentUser?.email} (Admin)</span>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                        >
                            서비스 홈
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="총 사용자"
                        value={stats.totalUsers}
                        icon={Users}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatCard
                        title="Pro 사용자"
                        value={stats.proUsers}
                        icon={CheckCircle}
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                    />
                    <StatCard
                        title="오늘 접속"
                        value={stats.activeToday}
                        icon={Activity}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <StatCard
                        title="누적 진단"
                        value={stats.totalDiagnostics}
                        icon={Search}
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                </div>

                {/* User Management Section */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* User List Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <User className="h-5 w-5" /> 사용자 관리
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    className="pl-9 pr-4 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="이메일 검색..."
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3">사용자 (Email)</th>
                                        <th className="px-6 py-3">가입일</th>
                                        <th className="px-6 py-3">등급 (Tier)</th>
                                        <th className="px-6 py-3 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                사용자 데이터가 없습니다. (profiles 테이블 확인 필요)
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-zinc-900">
                                                    {user.email}
                                                    {user.role === 'admin' && <span className="ml-2 text-xs bg-zinc-800 text-white px-1.5 py-0.5 rounded">ADMIN</span>}
                                                </td>
                                                <td className="px-6 py-3 text-zinc-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.tier === 'pro'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-zinc-100 text-zinc-600'
                                                        }`}>
                                                        {user.tier === 'pro' ? 'PRO' : 'FREE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => toggleUserTier(user.id, user.tier)}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {user.tier === 'free' ? 'Upgrade to Pro' : 'Downgrade'}
                                                        </button>
                                                    )}

                                                    {currentUser?.id !== user.id && (
                                                        <button
                                                            onClick={() => updateUserRole(user.id, user.role)}
                                                            className={`ml-3 text-xs font-medium hover:underline ${user.role === 'admin'
                                                                    ? 'text-red-600 hover:text-red-800'
                                                                    : 'text-zinc-500 hover:text-zinc-800'
                                                                }`}
                                                        >
                                                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Logs & Alerts */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-zinc-500" /> 최근 진단 로그
                            </h3>
                            <ul className="space-y-4">
                                {logs.length === 0 ? (
                                    <li className="text-xs text-zinc-400 text-center py-4">최근 기록 없음</li>
                                ) : (
                                    logs.map((log) => (
                                        <li key={log.id} className="flex flex-col gap-1 border-b border-zinc-50 last:border-0 pb-2 last:pb-0">
                                            <span className="text-sm font-medium text-zinc-800 truncate">{log.product_name}</span>
                                            <div className="flex justify-between text-xs text-zinc-400">
                                                <span>{new Date(log.created_at).toLocaleString()}</span>
                                                {/* <span>{log.user_email?.split('@')[0]}</span> */}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-zinc-500" /> 시스템 설정
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full text-left text-sm text-zinc-600 hover:bg-zinc-50 p-2 rounded flex justify-between items-center group">
                                    전체 알림 발송
                                    <ArrowUp className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
                                </button>
                                <button className="w-full text-left text-sm text-zinc-600 hover:bg-zinc-50 p-2 rounded flex justify-between items-center group">
                                    규제 데이터 업데이트
                                    <ArrowUp className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
                                </button>
                                <button className="w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded flex justify-between items-center">
                                    시스템 점검 모드 전환
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500">{title}</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{value?.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
        </div>
    );
}
