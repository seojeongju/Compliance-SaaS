"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, ChevronRight, FileText, Loader2, Search, Zap } from "lucide-react";
import { motion } from "framer-motion";

// Define the type for the API response
interface Certification {
    name: string;
    type: "legal" | "safety" | "hygiene" | "other";
    description: string;
    mandatory: boolean;
}

interface RequiredDocument {
    name: string;
    description: string;
}

interface DiagnosticResult {
    summary: string;
    probability_score: number;
    certifications: Certification[];
    estimated_cost: string;
    estimated_duration: string;
    required_documents: RequiredDocument[];
}

export default function DiagnosticPage() {
    const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
    const [formData, setFormData] = useState({
        productName: "",
        category: "electronics",
        description: "",
    });
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("analyzing");
        setError(null);

        try {
            const response = await fetch("/api/diagnostic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze product");
            }

            const data: DiagnosticResult = await response.json();
            setResult(data);
            setStep("result");
        } catch (err) {
            console.error(err);
            setError("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setStep("input");
        }
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
                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    )}
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
                                <option value="other">기타</option>
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
                    <p className="mt-2 text-zinc-600">입력하신 &quot;{formData.productName}&quot;에 해당하는<br />전기안전법, 전파법, 어린이제품안전특별법 등을 스캔 중입니다.</p>
                </div>
            )}

            {step === "result" && result && (
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
                        <p className="mt-2 font-medium text-blue-800">
                            {result.summary}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                            <Zap className="h-4 w-4" />
                            <span>규제 대상 확률: <strong>{result.probability_score}%</strong></span>
                        </div>
                    </div>

                    {/* Action Roadmap */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Required Certifications */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">1. 필수 인증 항목</h3>
                            <ul className="space-y-3">
                                {result.certifications.length > 0 ? (
                                    result.certifications.map((cert, index) => (
                                        <li key={index} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                                            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cert.mandatory ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                                                }`}>
                                                {cert.mandatory ? "법정" : "권장"}
                                            </span>
                                            <div>
                                                <h4 className="font-semibold text-zinc-900">{cert.name}</h4>
                                                <p className="text-sm text-zinc-500">{cert.description}</p>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-zinc-500">특별한 인증이 필요하지 않은 것으로 보입니다.</p>
                                )}
                            </ul>
                        </div>

                        {/* Cost & Timeline */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">2. 예상 비용 및 기간</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-zinc-600">예상 소요 기간</span>
                                    <span className="font-bold text-zinc-900">{result.estimated_duration}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-zinc-600">시험/인증 비용 (추정)</span>
                                    <span className="font-bold text-zinc-900">{result.estimated_cost}</span>
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
                                <span className="text-sm text-zinc-500">{result.required_documents.length}개 항목</span>
                            </div>
                            <div className="divide-y">
                                {result.required_documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-zinc-400" />
                                            <div>
                                                <span className="block font-medium text-zinc-900">{doc.name}</span>
                                                <span className="text-xs text-zinc-500">{doc.description}</span>
                                            </div>
                                        </div>
                                        {/* Placeholder action button */}
                                        <button className="text-sm font-medium text-blue-600 hover:underline">준비하기</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => {
                                setStep("input");
                                setResult(null);
                                setFormData({ productName: "", category: "electronics", description: "" });
                            }}
                            className="px-6 py-2 font-medium text-zinc-600 hover:text-zinc-900"
                        >
                            새로 진단하기
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
