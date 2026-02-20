"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle, FileText, ShieldCheck, Zap, Globe, Lock, Loader2, Tag, Search, Printer, Scale, MapPin, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "../lib/supabaseClient";

const workflowSteps = [
  {
    title: "1. 아이템 진단",
    desc: "품목과 사양을 입력하면 AI가 KC 인증, 전기안전 등 필수 규제 항목을 즉시 분석합니다.",
    icon: <Search className="h-6 w-6" />,
    color: "blue"
  },
  {
    title: "2. 서류 자동 생성",
    desc: "분석된 규제에 맞춰 시험 신청서, 제품 설명서 등 행정 서류를 표준 양식으로 자동 작성합니다.",
    icon: <Bot className="h-6 w-6" />,
    color: "indigo"
  },
  {
    title: "3. 인증 및 수출 가이드",
    desc: "라벨 도안 제작부터 해외 인증(CE, FDA) 로드맵, 정부 지원금 매칭까지 원스톱으로 지원합니다.",
    icon: <Zap className="h-6 w-6" />,
    color: "violet"
  }
];

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
      icon: <FileText className="h-6 w-6 text-white" />,
      color: "bg-blue-600 shadow-blue-200",
      title: "스마트 서류 생성",
      copy: "복잡한 공문서, AI가 대신 써드려요",
      desc: "제품 설명서, 시험 신청서, 사외 공문 등 까다로운 행정 서류 초안을 표준 양식에 맞춰 자동 생성합니다.",
      tags: ["#행정자동화", "#시간단축"],
      badge: "핵심",
      cta: "문서 생성하기",
      link: "/dashboard/diagnostic",
      id: "smart_doc"
    },
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      color: "bg-indigo-600 shadow-indigo-200",
      title: "정부지원사업 매칭",
      copy: "인증 비용, 나라에서 지원받으세요",
      desc: "인증 비용 지원, R&D 자금, 수출 바우처 등 현재 신청 가능한 정부 프로그램을 기업 맞춤형으로 매칭합니다.",
      tags: ["#비용절감", "#정부지원금"],
      badge: "추천",
      cta: "지원사업 찾기",
      link: "/dashboard/diagnostic",
      id: "subsidy"
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      color: "bg-amber-500 shadow-amber-200",
      title: "위험성 평가 (ISO)",
      copy: "글로벌 안전 기준에 따른 선제적 대응",
      desc: "제품의 타겟 연령과 사용 환경에 따른 잠재적 위험 요소를 ISO 표준에 따라 평가하고 저감 전략을 제안합니다.",
      tags: ["#안전성평가", "#글로벌표준"],
      cta: "위험성 체크",
      link: "/dashboard/diagnostic",
      id: "risk"
    },
    {
      icon: <Printer className="h-6 w-6 text-white" />,
      color: "bg-violet-600 shadow-violet-200",
      title: "표시사항(라벨) 메이커",
      copy: "법적 표시사항, 디자인까지 한 번에",
      desc: "품목별 필수 기재 사항(라벨)을 규격에 맞춰 생성하고 즉시 출력 가능한 최적화된 도안 파일을 제공합니다.",
      tags: ["#라벨링", "#완제품준비"],
      cta: "라벨 제작하기",
      link: "/dashboard/diagnostic",
      id: "label_maker"
    },
    {
      icon: <Scale className="h-6 w-6 text-white" />,
      color: "bg-rose-500 shadow-rose-200",
      title: "지재권 침해 분석",
      copy: "침해 걱정 없는 안전한 판매",
      desc: "제품 디자인이나 브랜드가 기존 상표권, 저작권을 침해하는지 AI 기반 대조 분석으로 리스크를 차단합니다.",
      tags: ["#지식재산권", "#안전판매"],
      cta: "침해 분석하기",
      link: "/dashboard/diagnostic",
      id: "ip_check"
    },
    {
      icon: <Globe className="h-6 w-6 text-white" />,
      color: "bg-teal-500 shadow-teal-200",
      title: "글로벌 수출 로드맵",
      copy: "글로벌 시장 진출을 위한 내비게이션",
      desc: "미국 FDA, 유럽 CE 등 진출 국가별 필수 규제와 인증 절차를 단계별 가이드 및 상세 비용 정보와 함께 제공합니다.",
      tags: ["#해외수출", "#글로벌인증"],
      cta: "로드맵 확인",
      link: "/dashboard/diagnostic",
      id: "global"
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
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold">Certi-Mate</span>
              <span className="text-[10px] font-medium text-zinc-500">(주)와우쓰리디</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-600">
            <Link href="#services" className="hover:text-blue-600 transition-colors">서비스</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">요금제</Link>
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
                  즉시진단받기(대시보드바로가기)
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
                    즉시진단받기(대시보드바로가기) <ArrowRight className="ml-2 h-5 w-5" />
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
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 무료회원 (종합진단)</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 유료회원 (정밀진단)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Brand Workflow Visualization Section */}
        <section className="bg-white py-24 border-y border-zinc-100 relative overflow-hidden text-zinc-900 leading-normal tracking-normal border-collapse border-spacing-0">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent -translate-y-1/2 hidden lg:block opacity-50" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase">Process</h2>
              <h3 className="mt-3 text-3xl font-bold text-zinc-900 sm:text-4xl">
                아이디어에서 제품 출시까지,<br />
                강력한 원스톱 규제 자동화
              </h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 max-w-5xl mx-auto">
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex flex-col items-center text-center p-6"
                >
                  <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-2xl border border-zinc-50 group transition-transform hover:scale-110`}>
                    <div className="text-blue-600 drop-shadow-sm">
                      {step.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 mb-4">{step.title}</h4>
                  <p className="text-zinc-500 leading-relaxed text-sm">
                    {step.desc}
                  </p>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-[40px] -right-4 translate-x-1/2 z-20">
                      <ArrowRight className="h-6 w-6 text-blue-200" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid (Services) */}
        <section id="services" className="bg-zinc-50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold text-blue-600">Our Services</h2>
                <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900">
                  성공적인 비즈니스를 위한<br />핵심 도구 모음
                </h3>
              </div>
              <p className="text-zinc-600 md:max-w-xs text-sm leading-relaxed border-l-2 border-blue-600 pl-4">
                단순 진단을 넘어 행정 업무의 전 과정을 디지털화하여 제조사의 생산성을 극대화합니다.
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

                  <Link
                    href={service.id ? `/dashboard/diagnostic?tool=${service.id}` : service.link}
                    className={`mt-auto w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${service.color.split(' ')[0]} hover:brightness-110 shadow-md`}
                  >
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
                  즉시진단받기(대시보드바로가기)
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
      <footer id="contact" className="border-t border-zinc-100 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-bold">Certi-Mate</span>
                  <span className="text-[10px] font-medium text-zinc-500">(주)와우쓰리디</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-500 max-w-sm leading-relaxed">
                <strong>(주)와우쓰리디 (WOW3D Co., Ltd.)</strong><br />
                데이터 기반 스마트 경영 솔루션 전문 기업.<br />
                복잡한 규제를 혁신 기술로 해결하고 고객의 비즈니스 성장을 지원합니다.
              </p>
              <div className="mt-6 space-y-2 text-sm text-zinc-500">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700">대표자:</span> 김순희
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700">사업자등록번호:</span> 849-88-01659
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-zinc-700 shrink-0">서울 본사:</span>
                  <span>서울시 마포구 독막로 93 상수빌딩 4층</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-zinc-700 shrink-0">구미 지사:</span>
                  <span>경북 구미시 산호대로 253 구미첨단의료기술타워 606호</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-zinc-700 shrink-0">전주 지사:</span>
                  <span>전북특별자치도 전주시 덕진구 반룡로 109 테크노빌 A동 207호</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">고객지원</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-500">
                <li>
                  <span className="block font-bold text-zinc-700">서울 연락처</span>
                  <a href="tel:02-3144-3137" className="hover:text-blue-600 transition-colors">02-3144-3137</a>
                </li>
                <li>
                  <span className="block font-bold text-zinc-700">구미 연락처</span>
                  <a href="tel:054-464-3137" className="hover:text-blue-600 transition-colors">054-464-3137</a>
                </li>
                <li>
                  <span className="block font-bold text-zinc-700">이메일</span>
                  <a href="mailto:wow3d16@naver.com" className="hover:text-blue-600 transition-colors">wow3d16@naver.com</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">제품</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li><Link href="#services" className="hover:text-blue-600">서비스 소개</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600">요금제</Link></li>
                <li><Link href="#" className="hover:text-blue-600">업데이트 소식</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">법적고지</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
            <p>&copy; {new Date().getFullYear()} (주)와우쓰리디. All rights reserved.</p>
            <div className="flex gap-6">
              <span>NCS On-Track</span>
              <span>WOW-Smart Manager</span>
              <span>WOW-CBT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
