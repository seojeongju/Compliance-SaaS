"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle, FileText, ShieldCheck, Zap, Globe, Lock, Loader2, Tag, Search, Printer, Scale, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const services = [
    {
      icon: <Search className="h-6 w-6 text-white" />,
      color: "bg-blue-600 shadow-blue-200",
      title: "아이템 인증 진단",
      copy: "내 제품, 인증이 필요할까?",
      desc: "키워드나 제품 사진만으로 필수 인증(KC, 전파법 등) 여부와 예상 비용을 1분 만에 진단합니다.",
      tags: ["#초기창업", "#리스크체크"],
      badge: "인기",
      cta: "지금 진단하기",
      link: "/dashboard/diagnostic"
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      color: "bg-indigo-600 shadow-indigo-200",
      title: "스마트 서류 생성",
      copy: "어려운 신청서, AI가 대신 써드려요",
      desc: "제품 설명서, 사유서, 성분표 등 복잡한 공문서 초안을 표준 양식에 맞춰 자동 생성합니다.",
      tags: ["#시간단축", "#자동작성"],
      badge: "신규",
      cta: "문서 만들기",
      link: "/dashboard/diagnostic"
    },
    {
      icon: <Printer className="h-6 w-6 text-white" />,
      color: "bg-violet-600 shadow-violet-200",
      title: "표시사항(라벨) 메이커",
      copy: "법적 표시사항, 디자인까지 한 번에",
      desc: "품목별 필수 기재 사항이 포함된 제품 라벨을 규격에 맞춰 생성하고 즉시 출력 가능한 파일을 제공합니다.",
      tags: ["#라벨링", "#완제품준비"],
      cta: "라벨 생성하기",
      link: "/dashboard" // Placeholder
    },
    {
      icon: <Scale className="h-6 w-6 text-white" />,
      color: "bg-rose-500 shadow-rose-200",
      title: "저작권·상표권 검사",
      copy: "침해 걱정 없는 안전한 판매",
      desc: "3D 모델링이나 브랜드 로고가 기존 저작권이나 상표권을 침해하는지 AI로 대조 분석합니다.",
      tags: ["#지식재산권", "#안전판매"],
      cta: "권리 분석하기",
      link: "/dashboard" // Placeholder
    },
    {
      icon: <Globe className="h-6 w-6 text-white" />,
      color: "bg-teal-500 shadow-teal-200",
      title: "수출 인증 로드맵",
      copy: "글로벌 시장 진출을 위한 첫걸음",
      desc: "미국 FDA, 유럽 CE 등 진출 국가별 필수 규제와 인증 절차를 단계별 가이드로 제공합니다.",
      tags: ["#해외수출", "#글로벌규제"],
      badge: "추천",
      cta: "로드맵 보기",
      link: "/dashboard" // Placeholder
    },
    {
      icon: <MapPin className="h-6 w-6 text-white" />,
      color: "bg-amber-500 shadow-amber-200",
      title: "정부지원사업 매칭",
      copy: "인증 비용, 나라에서 지원받으세요",
      desc: "현재 신청 가능한 인증 비용 지원금과 바우처 정보를 내 사업장 위치와 품목에 맞춰 추천합니다.",
      tags: ["#비용절감", "#정부지원금"],
      cta: "지원금 찾기",
      link: "/dashboard" // Placeholder
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 hover:opacity-80 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>Certi-Mate</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-600">
            <Link href="#services" className="hover:text-blue-600 transition-colors">서비스</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">요금제</Link>
            <Link href="#contact" className="hover:text-blue-600 transition-colors">문의하기</Link>
          </nav>
          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-zinc-600 sm:inline-block">
                  <strong>{user.email?.split('@')[0]}</strong>님
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition"
                >
                  대시보드로 이동
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 md:block">
                  로그인
                </Link>
                <Link
                  href="/dashboard/diagnostic"
                  className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-lg hover:bg-zinc-800 hover:scale-105 transition-all"
                >
                  무료 진단하기
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-200 to-indigo-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="mx-auto max-w-4xl space-y-8"
            >
              <div className="mx-auto inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                v1.0 정식 출시 기념 무료 진단 이벤트 중
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
                복잡한 규제 인증,<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI로 1분 만에 해결하세요
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-zinc-600 sm:text-xl">
                KC 인증, 식약처 허가, 해외 규제까지.
                제품 정보만 입력하면 AI가 필요한 모든 법적 절차와 비용, 기간을 분석해
                최적의 로드맵을 제시해 드립니다.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:-translate-y-1 sm:w-auto"
                  >
                    대시보드 바로가기 <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/diagnostic"
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:-translate-y-1 sm:w-auto"
                  >
                    지금 즉시 진단받기 <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}

                <div className="flex flex-col gap-1 text-xs text-zinc-400 sm:text-left">
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 별도 회원가입 없음 (체험)</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 100% 무료</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid (Services) */}
        <section id="services" className="bg-zinc-50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-blue-600">제공 서비스</h2>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                1인 창업자와 소규모 제조사를 위한<br className="hidden sm:inline" /> 맞춤형 솔루션
              </h3>
              <p className="mt-4 text-zinc-600">
                아이템 기획부터 수출까지, 단계별로 필요한 규제 해결 서비스를 선택해보세요.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, idx) => (
                <div key={idx} className="group relative flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-zinc-100 overflow-hidden">
                  {service.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                      {service.badge}
                    </div>
                  )}

                  <div>
                    <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${service.color} shadow-lg`}>
                      {service.icon}
                    </div>

                    <div className="mb-2">
                      <h4 className="font-semibold text-blue-600 text-sm mb-1">{service.copy}</h4>
                      <h3 className="text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                    </div>

                    <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                      {service.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {service.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-500/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href={service.link} className="mt-auto w-full rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]">
                    {service.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-zinc-900 py-24 text-white sm:py-32">
          {/* ... (Existing CTA Section remains unchanged) ... */}
          <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              규제 걱정 없이,<br />사업의 본질에만 집중하세요.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10">
              이미 수많은 하드웨어 스타트업과 제조 기업이 Certi-Mate를 통해<br className="hidden sm:inline" />
              안전하고 빠르게 제품을 출시하고 있습니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-900 hover:bg-zinc-100 hover:scale-105 transition-all"
                >
                  대시보드로 돌아가기
                </Link>
              ) : (
                <Link
                  href="/dashboard/diagnostic"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-900 hover:bg-zinc-100 hover:scale-105 transition-all"
                >
                  지금 무료로 시작하기
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl text-zinc-900">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <span>Certi-Mate</span>
              </div>
              <p className="mt-4 text-sm text-zinc-500 max-w-xs">
                AI 기반 제조 규제 진단 및 인증 가이드 솔루션.<br />
                복잡한 규제를 혁신 기술로 해결합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">제품</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li><Link href="#services" className="hover:text-blue-600">기능 소개</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600">요금제</Link></li>
                <li><Link href="#" className="hover:text-blue-600">업데이트</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">회사</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li><Link href="#" className="hover:text-blue-600">소개</Link></li>
                <li><Link href="#" className="hover:text-blue-600">블로그</Link></li>
                <li><Link href="#" className="hover:text-blue-600">채용</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">지원</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li><Link href="#" className="hover:text-blue-600">고객센터</Link></li>
                <li><Link href="#" className="hover:text-blue-600">이용약관</Link></li>
                <li><Link href="#" className="hover:text-blue-600">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-100 pt-8 text-center text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Certi-Mate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
