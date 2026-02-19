import Link from "next/link";
import { ArrowRight, Bot, CheckCircle, FileText, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <ShieldCheck className="h-6 w-6" />
            <span>Certi-Mate</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="#features" className="hover:text-blue-600">기능 소개</Link>
            <Link href="#pricing" className="hover:text-blue-600">요금제</Link>
            <Link href="/login" className="hover:text-blue-600">로그인</Link>
          </nav>
          <Link
            href="/dashboard/diagnostic"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            무료 진단하기
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center md:py-32">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              복잡한 인증은 AI에게,<br />창업자는 혁신에 집중하세요.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600">
              KC 인증, 식약처 허가, 해외 규제까지. <br className="hidden sm:inline" />
              제품 정보만 입력하면 AI가 필요한 모든 절차와 서류를 자동으로 안내해 드립니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
              <Link
                href="/dashboard/diagnostic"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                AI 규제 진단 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-200 px-8 text-base font-medium text-zinc-900 transition hover:bg-zinc-50 hover:text-blue-600"
              >
                데모 영상 보기
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-zinc-50 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                규제 해결을 위한 올인원 솔루션
              </h2>
              <p className="mt-4 text-zinc-600">
                초기 창업자가 겪는 인증의 어려움, Certi-Mate가 해결해 드립니다.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-xl bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">AI 아이템 진단</h3>
                <p className="text-zinc-600">
                  "이 제품 KC 인증 받아야 하나요?"<br />
                  제품 정보만 입력하면 AI가 관련 법령을 분석해 즉시 알려드립니다.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="rounded-xl bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">맞춤형 로드맵</h3>
                <p className="text-zinc-600">
                  인증 획득까지의 전체 과정을 타임라인으로 시각화하고, 예상 비용과 기간을 산출해 드립니다.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="rounded-xl bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">서류 자동 작성</h3>
                <p className="text-zinc-600">
                  복잡한 관공서 신고서, 기술문서.<br />
                  AI가 초안을 90% 이상 완성해 드립니다. (HWP/PDF 지원)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Compliance SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

