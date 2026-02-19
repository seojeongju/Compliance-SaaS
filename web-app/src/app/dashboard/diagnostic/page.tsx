"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, ChevronRight, FileText, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function DiagnosticPage() {
    const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
    const [formData, setFormData] = useState({
        productName: "",
        category: "electronics",
        description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("analyzing");
        // Simulate API call
        setTimeout(() => {
            setStep("result");
        }, 2500);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">AI 규제 진단</h1>
                <p className="mt-2 text-zinc-600">
                    제품 정보를 입력하면 필요한 인증과 규제를 AI가 분석해 드립니다.
                </p>
            </div>

            {step === "input" && (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border bg-white p-8 shadow-sm"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                제품명 (모델명)
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="예: 휴대용 블루투스 선풍기"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                카테고리
                            </label>
                            <select
                                className="w-full rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="electronics">전기/전자 제품</option>
                                <option value="kids">어린이 용품</option>
                                <option value="cosmetics">화장품</option>
                                <option value="food">식품/건강기능식품</option>
                                <option value="household">생활화학제품</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                제품 상세 설명
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="제품의 주요 기능, 사용 재질, 배터리 포함 여부 등을 자세히 적어주세요. (예: 3.7V 리튬이온 배터리가 내장된 스탠드형 선풍기입니다.)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700 transition"
                        >
                            <Search className="h-5 w-5" />
                            진단 시작하기
                        </button>
                    </div>
                </motion.form>
            )}

            {step === "analyzing" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <h2 className="mt-6 text-2xl font-bold">AI가 법령을 검토하고 있습니다...</h2>
                    <p className="mt-2 text-zinc-600">입력하신 "{formData.productName}"에 해당하는<br />전기안전법, 전파법, 어린이제품안전특별법 등을 스캔 중입니다.</p>
                </div>
            )}

            {step === "result" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Summary Card */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-blue-900">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                            진단 결과 요약
                        </h2>
                        <p className="mt-2 text-blue-800">
                            해당 제품은 <strong>[KC 방송통신기자재 적합등록]</strong> 및 <strong>[KC 전기용품 안전확인]</strong> 대상일 확률이 매우 높습니다 (95%).
                        </p>
                    </div>

                    {/* Action Roadmap */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Required Certifications */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">1. 필수 인증 항목</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                                        법정
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900">전파법 (적합등록)</h4>
                                        <p className="text-sm text-zinc-500">블루투스 모듈 포함 시 필수</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                        안전
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900">전기용품 안전확인</h4>
                                        <p className="text-sm text-zinc-500">배터리 및 충전 회로 검사</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Cost & Timeline */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">2. 예상 비용 및 기간</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-zinc-600">예상 소요 기간</span>
                                    <span className="font-bold text-zinc-900">4주 ~ 6주</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-zinc-600">시험/인증 비용 (추정)</span>
                                    <span className="font-bold text-zinc-900">약 180만원</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-zinc-600">서류 대행 수수료</span>
                                    <span className="font-bold text-blue-600">월 49,000원 (구독 시)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">3. 다음 단계 (서류 준비)</h3>
                        <div className="overflow-hidden rounded-lg border">
                            <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                                <span className="font-medium">필요 서류 목록</span>
                                <span className="text-sm text-zinc-500">3개 항목</span>
                            </div>
                            <div className="divide-y">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                        <span>사업자등록증 사본</span>
                                    </div>
                                    <button className="text-sm font-medium text-blue-600 hover:underline">업로드</button>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                        <span>회로도 (Schematic)</span>
                                    </div>
                                    <button className="text-sm font-medium text-blue-600 hover:underline">업로드</button>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                        <span>적합성평가 신청서</span>
                                    </div>
                                    <button className="flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-200">
                                        AI 자동작성 <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setStep("input")}
                            className="px-6 py-2 font-medium text-zinc-600 hover:text-zinc-900"
                        >
                            다시 진단하기
                        </button>
                        <button className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white shadow hover:bg-blue-700">
                            로드맵 저장 및 상담 신청
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
