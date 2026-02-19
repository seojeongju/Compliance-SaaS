"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Check,
    ShieldCheck,
    ArrowRight,
    Zap,
    Star,
    Building2,
    HelpCircle,
    ChevronDown,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseClient } from "../../lib/supabaseClient";

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error("Error checking user:", error);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            name: "Starter",
            price: billingCycle === "monthly" ? "0" : "0",
            description: "인증의 첫걸음을 떼는 개인 창업자를 위한 무료 플랜",
            features: [
                "기본 규제 진단 (월 3회)",
                "진단 이력 저장 (최근 5건)",
                "표준 문서 템플릿 제공",
                "이메일 지원 (평일 기준)",
            ],
            cta: "무료로 시작하기",
            highlight: false,
            color: "zinc",
            icon: <Zap className="h-5 w-5 text-zinc-500" />
        },
        {
            name: "Professional",
            price: billingCycle === "monthly" ? "49,000" : "39,000",
            description: "성장하는 제조 기업과 스타트업을 위한 스마트 솔루션",
            features: [
                "무제한 규제 진단",
                "모든 히스토리 무제한 보존",
                "AI 스마트 서류 생성 (무제한)",
                "글로벌 수출 로드맵 제공",
                "우선 상담 지원 서비스",
            ],
            cta: "프로 시작하기",
            highlight: true,
            color: "blue",
            icon: <Star className="h-5 w-5 text-blue-600" />
        },
        {
            name: "Enterprise",
            price: "별도문의",
            description: "대규모 조직을 위한 맞춤형 규제 준수 및 관리 시스템",
            features: [
                "전담 컴플라이언스 오피서 매칭",
                "팀 협업 및 멀티 계정 기능",
                "내부 결재 연동 API 제공",
                "정부 지원사업 자동 매칭 & 대행",
                "24/7 전용 핫라인 지원",
            ],
            cta: "도입 문의하기",
            highlight: false,
            color: "indigo",
            icon: <Building2 className="h-5 w-5 text-indigo-600" />
        }
    ];

    const faqs = [
        {
            q: "무료 진단은 정말 횟수 제한이 있나요?",
            a: "Starter 플랜의 경우 월 3회까지 상세 리포트를 생성할 수 있습니다. 무제한 진단이 필요하신 경우 Professional 플랜을 권장드려요."
        },
        {
            q: "연간 결제 시 할인 혜택이 어떻게 되나요?",
            a: "연간 결제 시 월 비용 대비 약 20% 할인된 가격으로 이용하실 수 있습니다."
        },
        {
            q: "AI가 생성한 서류를 그대로 제출해도 되나요?",
            a: "AI는 표준 가이드를 기반으로 초안을 작성합니다. 정확한 법적 효력을 위해 제출 전 내부 검토나 전문가의 확인을 거치는 것을 권장합니다."
        },
        {
            q: "중도 해지 시 환불 규정이 어떻게 되나요?",
            a: "디지털 서비스 특성상 결제 후 7일 이내, 서비스 이용 내역이 없는 경우 전액 환불이 가능합니다. 이후에는 잔여 기간에 대해 환불 처리가 진행됩니다."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header (Reuse Home Component Style) */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 hover:opacity-80 transition">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span>Certi-Mate</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                        ) : user ? (
                            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">대시보드</Link>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">로그인</Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-20 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">PRICING PLANS</h2>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900">
                            효율적인 규제 준수를 위한<br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                합리적인 요금 체계
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-zinc-500 text-lg sm:text-xl">
                            제품 기획부터 글로벌 진출까지. 비즈니스 규모에 맞춰<br className="hidden sm:inline" />
                            최적화된 플랜을 선택하고 리스크를 줄이세요.
                        </p>
                    </motion.div>

                    {/* Toggle */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-zinc-900 font-bold' : 'text-zinc-400 font-medium'}`}>월간 결제</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative h-7 w-14 rounded-full bg-zinc-200 p-1 transition-colors hover:bg-zinc-300 focus:outline-none"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="h-5 w-5 rounded-full bg-white shadow-sm"
                            />
                        </button>
                        <span className={`text-sm ${billingCycle === 'yearly' ? 'text-zinc-900 font-bold' : 'text-zinc-400 font-medium'}`}>
                            연간 결제 <span className="ml-1 text-xs text-blue-600 font-bold uppercase ring-1 ring-blue-100 bg-blue-50 px-1.5 py-0.5 rounded">-20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-24">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative flex flex-col rounded-3xl p-8 transition-all hover:-translate-y-2 
                                ${plan.highlight
                                    ? 'bg-white border-2 border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50'
                                    : 'bg-white border border-zinc-100 shadow-xl shadow-zinc-100'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    가장 인기 있는 선택
                                </div>
                            )}

                            <div className="mb-8 items-center flex justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-1">{plan.name}</h3>
                                    <p className="text-zinc-500 text-sm leading-snug">{plan.description}</p>
                                </div>
                                <div className={`p-3 rounded-2xl 
                                    ${plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                        plan.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-zinc-100 text-zinc-500'}`}>
                                    {plan.icon}
                                </div>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-zinc-900">
                                    {plan.price === '별도문의' ? '' : '₩'}
                                    {plan.price}
                                </span>
                                {plan.price !== '별도문의' && (
                                    <span className="text-zinc-400 font-medium font-sans">/월</span>
                                )}
                            </div>

                            <ul className="mb-10 space-y-4 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                                        <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center 
                                            ${plan.highlight ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full rounded-2xl py-4 text-center font-bold transition-all shadow-md active:scale-95
                                ${plan.highlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-200'
                                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                }`}>
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">자주 묻는 질문</h2>
                        <p className="text-zinc-500 font-medium leading-relaxed">회원님들이 가장 궁금해하시는 정보를 모았습니다.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all hover:border-blue-100">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <span className="font-bold text-zinc-900">{faq.q}</span>
                                    <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 text-zinc-500 text-sm leading-relaxed"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guarantee Banner */}
                <div className="rounded-3xl bg-zinc-900 p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">성공적인 제품 런칭의 동반자</h3>
                        <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                            Certi-Mate와 함께라면 법적인 리스크 없이 제품의 본질에만 집중할 수 있습니다.
                            지금 바로 시작하여 비즈니스의 격을 높여보세요.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href="/dashboard/diagnostic" className="rounded-full bg-white text-zinc-900 font-bold px-8 py-3.5 hover:bg-zinc-100 hover:scale-105 transition-all">
                                무료 진단 시작하기
                            </Link>
                            <button className="text-zinc-400 hover:text-white flex items-center gap-2 font-medium">
                                <HelpCircle className="h-5 w-5" /> 전문가 상담 요청
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-zinc-100 py-12 bg-zinc-50/50">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 font-bold text-xl text-zinc-900 mb-4 font-sans">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        <span>Certi-Mate</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                        &copy; {new Date().getFullYear()} Certi-Mate. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
