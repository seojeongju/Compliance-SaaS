"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle, FileText, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

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
            <Link href="#features" className="hover:text-blue-600 transition-colors">기능 소개</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">이용 방법</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">요금제</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 md:block">
              로그인
            </Link>
            <Link
              href="/dashboard/diagnostic"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-lg hover:bg-zinc-800 hover:scale-105 transition-all"
            >
              무료 진단하기
            </Link>
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
                <Link
                  href="/dashboard/diagnostic"
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:-translate-y-1 sm:w-auto"
                >
                  지금 즉시 진단받기 <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <div className="flex flex-col gap-1 text-xs text-zinc-400 sm:text-left">
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 별도 회원가입 없음</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 100% 무료</span>
                </div>
              </div>
            </motion.div>

            {/* Abstract Dashboard Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-20 -mb-24 flow-root sm:mt-24"
            >
              <div className="relative mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-zinc-50/50 p-2 shadow-2xl backdrop-blur-xl lg:rounded-3xl lg:p-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden lg:rounded-2xl">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-4 w-32 rounded bg-zinc-100"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                      <div className="h-32 rounded-lg bg-blue-50/50 p-4 border border-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">AI 규제 진단 리포트 생성 중...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-zinc-100"></div>
                        <div className="h-4 w-1/2 rounded bg-zinc-100"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-20 rounded-lg bg-zinc-50 border border-zinc-100"></div>
                      <div className="h-20 rounded-lg bg-zinc-50 border border-zinc-100"></div>
                      <div className="h-20 rounded-lg bg-zinc-50 border border-zinc-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-zinc-50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-blue-600">핵심 기능</h2>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                규제 해결을 위한 올인원 솔루션
              </h3>
              <p className="mt-4 text-zinc-600">
                초기 창업자가 겪는 복잡하고 어려운 인증 과정, Certi-Mate가 쉽고 빠르게 해결해 드립니다.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Bot className="h-6 w-6 text-white" />,
                  color: "bg-blue-600",
                  title: "AI 아이템 진단",
                  desc: "제품 정보만 입력하면 AI가 관련 법령을 3분 안에 분석해, 받아야 할 인증을 정확히 알려드립니다."
                },
                {
                  icon: <ShieldCheck className="h-6 w-6 text-white" />,
                  color: "bg-indigo-600",
                  title: "위험성 사전 평가",
                  desc: "리콜 사례와 규제 데이터를 기반으로 제품의 잠재적 위험 요소를 사전에 감지하고 대비책을 제안합니다."
                },
                {
                  icon: <FileText className="h-6 w-6 text-white" />,
                  color: "bg-violet-600",
                  title: "서류 자동 작성",
                  desc: "복잡한 관공서 신고서, 시험 신청서 등의 초안을 AI가 90% 이상 완성된 상태로 생성해 드립니다."
                },
                {
                  icon: <Zap className="h-6 w-6 text-white" />,
                  color: "bg-amber-500",
                  title: "실시간 비용/기간 산출",
                  desc: "인증 획득까지 걸리는 예상 기간과 소요 비용을 미리 파악하여 예산 계획을 세울 수 있습니다."
                },
                {
                  icon: <Globe className="h-6 w-6 text-white" />,
                  color: "bg-teal-500",
                  title: "해외 규제 대응",
                  desc: "국내뿐만 아니라 미국 FDA, 유럽 CE 등 해외 수출에 필요한 규제 사항도 한 번에 확인할 수 있습니다."
                },
                {
                  icon: <Lock className="h-6 w-6 text-white" />,
                  color: "bg-rose-500",
                  title: "규제 모니터링",
                  desc: "관련 법안이 변경되면 알림을 받아볼 수 있어, 사업 운영 중 발생할 수 있는 리스크를 최소화합니다."
                },
              ].map((feature, idx) => (
                <div key={idx} className="group relative rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-zinc-100">
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} shadow-lg shadow-opacity-20`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-zinc-900 py-24 text-white sm:py-32">
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
              <Link
                href="/dashboard/diagnostic"
                className="rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-900 hover:bg-zinc-100 hover:scale-105 transition-all"
              >
                지금 무료로 시작하기
              </Link>
              <Link
                href="#contact"
                className="rounded-full border border-zinc-700 px-8 py-4 text-lg font-medium text-white hover:bg-zinc-800 transition-all"
              >
                도입 문의하기
              </Link>
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
                <li><Link href="#" className="hover:text-blue-600">기능 소개</Link></li>
                <li><Link href="#" className="hover:text-blue-600">요금제</Link></li>
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
