"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart, FileText, Plus, Search, ShieldCheck, Zap, Clock, Users, BookOpen } from "lucide-react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        diagnosticCount: 0,
        documentCount: 0,
    });
    const [recentDiagnostics, setRecentDiagnostics] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch stats
                const { count: diagnosticCount } = await supabase
                    .from('diagnostic_results')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                const { count: documentCount } = await supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setStats({
                    diagnosticCount: diagnosticCount || 0,
                    documentCount: documentCount || 0,
                });

                // Fetch recent diagnostics
                const { data: recent } = await (supabase as any)
                    .from('diagnostic_results')
                    .select('id, product_name, created_at, category, result_json')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (recent) setRecentDiagnostics(recent);
            }
        };

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    반갑습니다, {user ? user.email?.split('@')[0] : 'Guest'}님 👋
                </h1>
                <p className="text-zinc-500">
                    오늘도 Certi-Mate와 함께 안전하고 스마트하게 규제를 관리하세요.
                </p>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <BarChart className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">전체 진단 횟수</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{stats.diagnosticCount}건</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">생성된 문서</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{stats.documentCount}건</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">컨설팅 매칭</p>
                            <h3 className="text-2xl font-bold text-zinc-900">0건</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">남은 구독 기간</p>
                            <h3 className="text-2xl font-bold text-zinc-900">30일</h3>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants}>
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">빠른 시작</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Link href="/dashboard/diagnostic" className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-50 transition-transform group-hover:scale-150" />
                                <div className="relative z-10 flex items-start justify-between">
                                    <div>
                                        <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-600">
                                            <Search className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-900">새로운 규제 진단</h3>
                                        <p className="mt-1 text-sm text-zinc-500">제품 정보를 입력하고<br />필요한 인증을 확인하세요.</p>
                                    </div>
                                    <div className="rounded-full bg-zinc-100 p-2 text-zinc-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/dashboard/diagnostic" className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-indigo-50 transition-transform group-hover:scale-150" />
                                <div className="relative z-10 flex items-start justify-between">
                                    <div>
                                        <div className="mb-3 inline-flex rounded-lg bg-indigo-100 p-2 text-indigo-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-900">문서 자동 작성</h3>
                                        <p className="mt-1 text-sm text-zinc-500">복잡한 신청 서류를<br />AI로 10초 만에 생성하세요.</p>
                                    </div>
                                    <div className="rounded-full bg-zinc-100 p-2 text-zinc-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Recent Diagnostics */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-zinc-900">최근 진단 이력</h2>
                            <Link href="/dashboard/diagnostic" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                전체보기
                            </Link>
                        </div>
                        {recentDiagnostics.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500 bg-zinc-50">
                                아직 진행된 진단이 없습니다. 첫 번째 진단을 시작해보세요!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentDiagnostics.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4 shadow-sm hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900">{item.product_name}</h4>
                                                <p className="text-xs text-zinc-500">
                                                    {item.category} • {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                규제대상 확률 {item.result_json?.probability_score}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Sidebar - Info/Tips */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Compliance Tip Card */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-6">
                        <div className="mb-4 flex items-center gap-2 text-amber-800">
                            <BookOpen className="h-5 w-5" />
                            <h3 className="font-bold">오늘의 규제 팁</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-amber-900">
                            <strong>KC 인증 마크</strong>는 제품 본체뿐만 아니라, 포장 박스에도 반드시 표시해야 합니다. 이를 지키지 않으면 과태료 대상이 될 수 있습니다.
                        </p>
                        <div className="mt-4">
                            <Link href="#" className="text-sm font-semibold text-amber-700 hover:underline">
                                더 알아보기 →
                            </Link>
                        </div>
                    </div>

                    {/* New Updates */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-bold text-zinc-900">최신 업데이트</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors">
                                        어린이 제품 안전 특별법 개정안 안내
                                    </p>
                                    <span className="text-xs text-zinc-400">2026.02.18</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                                <div>
                                    <p className="text-sm text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors">
                                        AI 문서 생성 엔진 v2.0 업데이트
                                    </p>
                                    <span className="text-xs text-zinc-400">2026.02.10</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-300" />
                                <div>
                                    <p className="text-sm text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors">
                                        전파법 적합성 평가 절차 가이드
                                    </p>
                                    <span className="text-xs text-zinc-400">2026.02.01</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                        <div className="relative z-10">
                            <h3 className="mb-2 text-lg font-bold">전문가 상담이 필요하신가요?</h3>
                            <p className="mb-4 text-sm text-blue-100">
                                규제 전문가와 1:1 매칭을 통해<br />더 상세한 솔루션을 받아보세요.
                            </p>
                            <button className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
                                상담 예약하기
                            </button>
                        </div>
                        <ShieldCheck className="absolute -bottom-4 -right-4 h-32 w-32 opacity-20 rotate-12" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
