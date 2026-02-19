"use client";

import { useState, useEffect } from "react";
import {
    AlertCircle, CheckCircle, ChevronRight, FileText, Loader2, Search, Zap,
    Download, Clock, History, Trash2, Lock, Shield, Settings, Globe,
    Scale, AlertTriangle, Printer, Cpu, FileDown
} from "lucide-react";
import { createSupabaseClient } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Types ---

type Mode = "hub" | "general" | "detailed";
type GeneralStep = "input" | "analyzing" | "result" | "generating_doc" | "doc_result";

// Detailed Diagnostic Tool Types
type DetailedTool = "deep_scan" | "risk_assessment" | "smart_doc" | "label_maker" | "ip_check" | "global_roadmap";

interface Certification {
    name: string;
    type: "legal" | "safety" | "hygiene" | "other";
    description: string;
    mandatory: boolean;
}

interface RequiredDocument {
    name: string;
    description: string;
    type: string;
}

interface DiagnosticResult {
    summary: string;
    probability_score: number;
    certifications: Certification[];
    estimated_cost: string;
    estimated_duration: string;
    required_documents: RequiredDocument[];
}

interface GeneratedDoc {
    title: string;
    content: string;
}

interface LabelResult {
    product_name: string;
    model_name: string;
    capacity: string;
    manufacturer: string;
    country_of_origin: string;
    manufacturing_date: string;
    precautions: string;
    kc_mark_guideline: string;
    recycle_mark: string;
    additional_info: string;
}

interface GlobalRoadmapResult {
    target_country: string;
    key_certifications: Array<{
        name: string;
        description: string;
        mandatory: boolean;
    }>;
    regulatory_authority: string;
    estimated_timeline: string;
    estimated_cost: string;
    process_steps: string[];
    customs_tips: string;
}

// --- Main Component ---

export default function DiagnosticPage() {
    const [mode, setMode] = useState<Mode>("hub");
    const [userTier, setUserTier] = useState<"free" | "pro">("free"); // Mock Tier State
    const [history, setHistory] = useState<any[]>([]);

    // -- General Diagnostic States --
    const [step, setStep] = useState<GeneralStep>("input");
    const [formData, setFormData] = useState({
        productName: "",
        category: "electronics",
        description: "",
    });
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedDoc, setGeneratedDoc] = useState<GeneratedDoc | null>(null);
    const [generatingDocName, setGeneratingDocName] = useState<string>("");

    // -- Detailed Diagnostic States --
    const [activeDetailedTool, setActiveDetailedTool] = useState<DetailedTool | null>(null);
    const [labelFormData, setLabelFormData] = useState({
        productName: "",
        productType: "",
        weight: "",
        manufacturer: "",
        precautions: "",
    });
    const [labelResult, setLabelResult] = useState<LabelResult | null>(null);

    // Global Roadmap States
    const [globalFormData, setGlobalFormData] = useState({
        productName: "",
        category: "electronics",
        targetCountry: "USA",
        description: "",
    });
    const [globalResult, setGlobalResult] = useState<GlobalRoadmapResult | null>(null);

    useEffect(() => {
        loadHistory();
        loadUserTier();
    }, []);

    async function loadUserTier() {
        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUserTier(data.tier as "free" | "pro");
                }
            }
        } catch (e) {
            console.error("Profile load error", e);
        }
    }

    async function loadHistory() {
        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('diagnostic_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(6);
                if (data) setHistory(data);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error("History load error", e);
        }
    }

    const loadHistoryItem = (item: any) => {
        setResult(item.result_json);
        setFormData({
            productName: item.product_name,
            category: item.category,
            description: item.description || "",
        });
        setMode("general");
        setStep("result");
    };

    const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('정말 이 진단 이력을 삭제하시겠습니까?')) return;

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase.from('diagnostic_results').delete().eq('id', id);
            if (error) throw error;
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error("Delete error", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // --- General Diagnostic Functionality ---

    const handleGeneralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("analyzing");
        setError(null);

        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch("/api/diagnostic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, userId: user?.id }),
            });

            if (!response.ok) throw new Error("Failed to analyze product");

            const data: DiagnosticResult = await response.json();
            setResult(data);
            setStep("result");
            loadHistory(); // Reload history to show the new item
        } catch (err) {
            console.error(err);
            setError("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setStep("input");
        }
    };

    const generateDocument = async (docType: string, docName: string) => {
        setGeneratingDocName(docName);
        setStep("generating_doc");
        setError(null);

        try {
            const response = await fetch("/api/generate-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: formData.productName,
                    category: formData.category,
                    description: formData.description,
                    documentType: docType,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate document");
            }

            const docData: GeneratedDoc = await response.json();
            setGeneratedDoc(docData);
            setStep("doc_result");
        } catch (err: unknown) {
            console.error(err);
            setError("문서 생성 중 오류가 발생했습니다.");
            setStep("result");
        } finally {
            setGeneratingDocName("");
        }
    };

    // --- Detailed Diagnostic Functionality (Label Maker) ---
    // --- Detailed Diagnostic Functionality (Label Maker) ---
    const handleLabelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("analyzing");
        setError(null);

        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch("/api/diagnostic/label", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...labelFormData, userId: user?.id }),
            });

            if (!response.ok) throw new Error("Failed to generate label");

            const data: LabelResult = await response.json();
            setLabelResult(data);
            setStep("result");
        } catch (err) {
            console.error(err);
            setError("라벨 생성 중 오류가 발생했습니다.");
            setStep("result"); // Should ideally allow retry
        }
    };

    const handleGlobalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("analyzing");
        setError(null);

        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch("/api/diagnostic/global", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...globalFormData, userId: user?.id }),
            });

            if (!response.ok) throw new Error("Failed to generate roadmap");

            const data: GlobalRoadmapResult = await response.json();
            setGlobalResult(data);
            setStep("result");
        } catch (err) {
            console.error(err);
            setError("로드맵 생성 중 오류가 발생했습니다.");
            setStep("result");
        }
    };

    const downloadLabelPDF = async () => {
        if (!labelResult) return;

        const doc = new jsPDF();

        try {
            // Fetch Korean Font (NanumGothic) from Google Fonts
            const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Regular.ttf";
            const response = await fetch(fontUrl);
            if (!response.ok) throw new Error("Failed to load Korean font");

            const fontBuffer = await response.arrayBuffer();
            const fontUint8 = new Uint8Array(fontBuffer);

            // Convert Uint8Array to binary string for jsPDF
            let fontBinary = "";
            for (let i = 0; i < fontUint8.length; i++) {
                fontBinary += String.fromCharCode(fontUint8[i]);
            }

            // Add font to VFS and register
            doc.addFileToVFS("NanumGothic.ttf", fontBinary);
            doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
            doc.setFont("NanumGothic");

            doc.setFontSize(18);
            doc.text("제품 표시사항 (Label Draft)", 105, 20, { align: "center" });

            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });

            const tableData = [
                ["품명 (Product Name)", labelResult.product_name],
                ["모델명 (Model)", labelResult.model_name],
                ["용량/중량 (Capacity)", labelResult.capacity],
                ["제조자/수입자 (Manufacturer)", labelResult.manufacturer],
                ["제조국 (Origin)", labelResult.country_of_origin],
                ["제조연월 (Mfg Date)", labelResult.manufacturing_date],
            ];

            autoTable(doc, {
                startY: 35,
                head: [['항목 (Item)', '내용 (Content)']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [79, 70, 229], // Indigo-600
                    font: "NanumGothic",
                    fontStyle: "normal"
                },
                bodyStyles: {
                    font: "NanumGothic",
                    fontStyle: "normal"
                },
                styles: {
                    font: "NanumGothic", // Global font fallback for table
                    fontStyle: "normal"
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont("NanumGothic", "normal");

            doc.text("사용상 주의사항 (Precautions):", 14, finalY);
            doc.setFontSize(10);
            const splitPrecautions = doc.splitTextToSize(labelResult.precautions, 180);
            doc.text(splitPrecautions, 14, finalY + 7);

            const nextY = finalY + 10 + (splitPrecautions.length * 5);

            doc.setFontSize(12);
            doc.text("KC 마크 표기 가이드 (KC Mark Guide):", 14, nextY);
            doc.setFontSize(10);
            const splitKC = doc.splitTextToSize(labelResult.kc_mark_guideline, 180);
            doc.text(splitKC, 14, nextY + 7);

            if (labelResult.additional_info) {
                const afterKCY = nextY + 10 + (splitKC.length * 5);
                doc.setFontSize(12);
                doc.text("기타 표기 (Additional Info):", 14, afterKCY);
                doc.setFontSize(10);
                const splitAdd = doc.splitTextToSize(labelResult.additional_info, 180);
                doc.text(splitAdd, 14, afterKCY + 7);
            }

            doc.save(`${labelResult.product_name}_label_draft.pdf`);

        } catch (err) {
            console.error("Font loading error:", err);
            alert("한글 폰트 로딩에 실패하여 기본 폰트로 다운로드됩니다. (글자가 깨질 수 있습니다)");
            doc.save(`${labelResult.product_name}_label_draft_no_font.pdf`);
        }
    };


    // --- Components ---

    const DiagnosticHub = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900">규제 진단 센터</h1>
                <p className="text-zinc-500">
                    제품의 인증 요건을 확인하고, 필요한 문서를 자동으로 생성하세요.
                </p>

                {/* Temporary User Tier Toggle for Demo */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setUserTier(prev => prev === 'free' ? 'pro' : 'free')}
                        className="text-xs bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full text-zinc-500 transition-colors"
                    >
                        [Demo] 현재 등급: <span className={`font-bold ${userTier === 'pro' ? 'text-indigo-600' : 'text-blue-600'}`}>
                            {userTier === 'free' ? '일반 (Free)' : '전문가 (Pro)'}
                        </span> (클릭하여 변경)
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* General Diagnostic Card */}
                <div
                    onClick={() => setMode("general")}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-6">
                            <Search className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">종합 진단 (Standard)</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Free</span>
                            <span className="text-zinc-400 text-sm">|</span>
                            <span className="text-sm text-zinc-500">기본 제공</span>
                        </div>
                        <p className="text-zinc-600 mb-6 leading-relaxed">
                            제품명과 설명만으로 필요한 인증을 1분 안에 빠르게 파악합니다.<br />
                            전체적인 규제 로드맵과 예상 비용을 확인하세요.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-500 mb-8">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                <span>필수 법적 규제 스캔</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                <span>예상 비용/기간 산출</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                <span>진단 이력 저장</span>
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            종합 진단 시작하기 <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Detailed Diagnostic Card */}
                <div
                    onClick={() => {
                        // In real app, check permission here. 
                        // For demo, we let them enter but features might be locked or shown with visual cues.
                        setMode("detailed");
                    }}
                    className={`group cursor-pointer relative overflow-hidden rounded-2xl border bg-white p-8 transition-all hover:-translate-y-1 ${userTier === 'pro'
                        ? 'border-indigo-200 hover:border-indigo-500 hover:shadow-xl'
                        : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="h-32 w-32 text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-6 ${userTier === 'pro' ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-400'
                            }`}>
                            <Settings className="h-6 w-6" />
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 transition-colors ${userTier === 'pro' ? 'text-zinc-900 group-hover:text-indigo-600' : 'text-zinc-500'
                            }`}>상세 진단 (Pro)</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${userTier === 'pro' ? 'bg-indigo-50 text-indigo-700' : 'bg-zinc-100 text-zinc-500'
                                }`}>Pro Only</span>
                            {userTier !== 'pro' && (
                                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                    <Lock className="h-3 w-3" /> 잠김
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-600 mb-6 leading-relaxed">
                            부품 단위의 정밀 분석과 실제 문서 생성까지.<br />
                            6가지 전문 도구로 실무 수준의 규제 업무를 처리합니다.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-500 mb-8">
                            <li className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${userTier === 'pro' ? 'text-indigo-500' : 'text-zinc-300'}`} />
                                <span>6대 전문 진단 도구</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${userTier === 'pro' ? 'text-indigo-500' : 'text-zinc-300'}`} />
                                <span>스마트 서류 생성 (HWP/Word)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${userTier === 'pro' ? 'text-indigo-500' : 'text-zinc-300'}`} />
                                <span>라벨(표시사항) 디자인</span>
                            </li>
                        </ul>
                        <button className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${userTier === 'pro'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed hover:bg-zinc-200'
                            }`}>
                            상세 기능 살펴보기 <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent History Section (Only visible in Hub) */}
            <div className="mt-16 border-t border-zinc-100 pt-12">
                <div className="flex items-center gap-2 mb-6">
                    <History className="h-5 w-5 text-zinc-500" />
                    <h2 className="text-xl font-bold text-zinc-900">최근 진단 이력</h2>
                </div>

                {history.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
                        아직 진단 이력이 없습니다. 첫 진단을 시작해보세요!
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -2 }}
                                onClick={() => loadHistoryItem(item)}
                                className="relative cursor-pointer rounded-xl border bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                        {item.category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => deleteHistoryItem(e, item.id)}
                                            className="rounded p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            title="이력 삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-900 line-clamp-1 mb-1">{item.product_name}</h3>
                                <p className="text-sm text-zinc-500 line-clamp-2 h-10">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const DetailedGrid = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => {
                        if (activeDetailedTool) {
                            setActiveDetailedTool(null);
                            setLabelResult(null);
                        } else {
                            setMode("hub");
                        }
                    }}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ChevronRight className="h-4 w-4 rotate-180" /> {activeDetailedTool ? "도구 목록" : "이전으로"}
                </button>
                <div className="h-4 w-px bg-zinc-300"></div>
                <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-600" /> 상세 진단 도구
                </h1>
                {userTier === 'free' && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Pro 기능 잠김
                    </span>
                )}
            </div>

            {!activeDetailedTool ? (
                // Detailed Tool Selection Grid
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { id: "label_maker", title: "라벨 표시사항 제작", icon: Printer, desc: "포장재질과 용량에 맞춘 필수 법적 기재사항(라벨) 도안을 생성합니다.", blocked: false }, // Open this for demo
                        { id: "deep_scan", title: "심층 정밀 진단", icon: scanIcon, desc: "부품 리스트(BOM)와 회로도를 기반으로 KC 인증 항목을 정밀하게 분석합니다.", blocked: true },
                        { id: "risk", title: "위험성 평가 (ISO)", icon: AlertTriangle, desc: "제품의 타겟 연령과 사용 환경에 따른 잠재적 위험 요소를 평가합니다.", blocked: true },
                        { id: "smart_doc", title: "스마트 서류 생성", icon: FileText, desc: "시험 신청서, 제품 설명서 등 복잡한 공문서 초안을 AI가 작성합니다.", blocked: true },
                        { id: "ip_check", title: "지재권 침해 분석", icon: Scale, desc: "제품 디자인이나 상표가 기존 특허권을 침해하는지 대조 분석합니다.", blocked: true },
                        { id: "global", title: "글로벌 수출 로드맵", icon: Globe, desc: "미국(FDA), 유럽(CE) 등 해외 수출 시 필요한 국가별 인증 정보를 제공합니다.", blocked: false }, // Unlocked
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className={`group relative rounded-xl border bg-white p-6 transition-all ${userTier === 'pro'
                                ? 'border-zinc-200 hover:border-indigo-500 hover:shadow-lg cursor-pointer'
                                : 'border-zinc-100 bg-zinc-50'
                                }`}
                            onClick={() => {
                                if (userTier === 'free') {
                                    alert("Pro 등급으로 업그레이드하시면 이용할 수 있습니다.");
                                } else if (item.blocked) {
                                    alert(`${item.title} 기능은 준비 중입니다.`);
                                } else {
                                    setActiveDetailedTool(item.id as DetailedTool);
                                }
                            }}
                        >
                            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${userTier === 'pro' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-200 text-zinc-400'
                                }`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${userTier === 'pro' ? 'text-zinc-900' : 'text-zinc-500'
                                }`}>{item.title}</h3>
                            <p className={`text-sm mb-4 leading-relaxed ${userTier === 'pro' ? 'text-zinc-600' : 'text-zinc-400'
                                }`}>
                                {item.desc}
                            </p>

                            {userTier === 'free' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                    <div className="bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-full flex items-center gap-2 shadow-xl">
                                        <Lock className="h-3 w-3" /> Upgrade to Pro
                                    </div>
                                </div>
                            )}

                            {userTier === 'pro' && !item.blocked && (
                                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    실행하기 <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Active Detailed Tool View (Example: Label Maker)
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    {activeDetailedTool === 'label_maker' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-zinc-900 mb-2">🏷️ 라벨 표시사항 제작 (Label Maker)</h2>
                                <p className="text-zinc-600">제품 포장에 반드시 표기해야 할 법적 사항을 자동으로 생성해 드립니다.</p>
                            </div>

                            {!labelResult ? (
                                <form onSubmit={handleLabelSubmit} className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">품명 (제품명)</label>
                                            <input
                                                required
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={labelFormData.productName}
                                                onChange={e => setLabelFormData({ ...labelFormData, productName: e.target.value })}
                                                placeholder="예: 퓨어 핸드워시"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">종류/모델</label>
                                            <input
                                                required
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={labelFormData.productType}
                                                onChange={e => setLabelFormData({ ...labelFormData, productType: e.target.value })}
                                                placeholder="예: 액체형 / HW-2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">용량/중량</label>
                                            <input
                                                required
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={labelFormData.weight}
                                                onChange={e => setLabelFormData({ ...labelFormData, weight: e.target.value })}
                                                placeholder="예: 500ml"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">제조자/수입자</label>
                                            <input
                                                required
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={labelFormData.manufacturer}
                                                onChange={e => setLabelFormData({ ...labelFormData, manufacturer: e.target.value })}
                                                placeholder="예: (주)서티메이트"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">사용상 주의사항 (선택)</label>
                                        <textarea
                                            className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                            rows={3}
                                            value={labelFormData.precautions}
                                            onChange={e => setLabelFormData({ ...labelFormData, precautions: e.target.value })}
                                            placeholder="특별히 강조할 주의사항이 있다면 입력해주세요."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={step === "analyzing"}
                                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                                        >
                                            {step === "analyzing" ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" /> 생성 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Printer className="h-5 w-5" /> 라벨 도안 생성하기
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border bg-white p-8 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                                        <h3 className="text-xl font-bold text-zinc-900">도안 생성 결과</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLabelResult(null)}
                                                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900"
                                            >
                                                다시 작성하기
                                            </button>
                                            <button
                                                onClick={downloadLabelPDF}
                                                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                                            >
                                                <Download className="h-4 w-4" /> PDF 다운로드
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 text-sm leading-relaxed space-y-4">
                                        <div className="grid grid-cols-[120px_1fr] gap-2 border-b pb-4 border-zinc-200">
                                            <span className="font-bold text-zinc-600">품명</span>
                                            <span className="text-zinc-900">{labelResult.product_name}</span>

                                            <span className="font-bold text-zinc-600">종류/모델</span>
                                            <span className="text-zinc-900">{labelResult.model_name}</span>

                                            <span className="font-bold text-zinc-600">용량/중량</span>
                                            <span className="text-zinc-900">{labelResult.capacity}</span>

                                            <span className="font-bold text-zinc-600">제조/수입자</span>
                                            <span className="text-zinc-900">{labelResult.manufacturer}</span>

                                            <span className="font-bold text-zinc-600">제조국</span>
                                            <span className="text-zinc-900">{labelResult.country_of_origin}</span>

                                            <span className="font-bold text-zinc-600">제조연월</span>
                                            <span className="text-zinc-900">{labelResult.manufacturing_date}</span>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-zinc-900 mb-1">사용상 주의사항</h4>
                                            <p className="text-zinc-600 whitespace-pre-wrap">{labelResult.precautions}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                                            <div className="bg-white p-3 rounded border border-zinc-200">
                                                <h4 className="font-bold text-zinc-900 mb-1 text-xs">KC 마크 표기 가이드</h4>
                                                <p className="text-zinc-600 text-xs">{labelResult.kc_mark_guideline}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded border border-zinc-200">
                                                <h4 className="font-bold text-zinc-900 mb-1 text-xs">재활용 표기</h4>
                                                <p className="text-zinc-600 text-xs">{labelResult.recycle_mark}</p>
                                            </div>
                                        </div>

                                        {labelResult.additional_info && (
                                            <div className="pt-2">
                                                <h4 className="font-bold text-zinc-900 mb-1">기타 법적 표기</h4>
                                                <p className="text-zinc-600">{labelResult.additional_info}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 text-sm">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <p>
                                            이 결과물은 AI가 생성한 초안입니다. 실제 인쇄 전 반드시 관련 법령(표시광고법 등)을 확인하거나 전문가의 검수를 받으시기 바랍니다.
                                        </p>
                                    </div>
                                    <div className="mt-2 text-xs text-zinc-400 text-right">
                                        * PDF 다운로드 시 인터넷 연결이 필요합니다. (한글 폰트 다운로드)
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {activeDetailedTool === 'global' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-zinc-900 mb-2">🌍 글로벌 수출 로드맵 (Global Export Roadmap)</h2>
                                <p className="text-zinc-600">해외 진출 시 필요한 국가별 인증 및 규제 정보를 분석하여 제공합니다.</p>
                            </div>

                            {!globalResult ? (
                                <form onSubmit={handleGlobalSubmit} className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">품명 (제품명)</label>
                                            <input
                                                required
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={globalFormData.productName}
                                                onChange={e => setGlobalFormData({ ...globalFormData, productName: e.target.value })}
                                                placeholder="예: 스마트 LED 조명"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">카테고리</label>
                                            <select
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={globalFormData.category}
                                                onChange={(e) => setGlobalFormData({ ...globalFormData, category: e.target.value })}
                                            >
                                                <option value="electronics">전자제품 (Electronics)</option>
                                                <option value="cosmetics">화장품 (Cosmetics)</option>
                                                <option value="food">식품 (Food)</option>
                                                <option value="kids">어린이 제품 (Toys/Kids)</option>
                                                <option value="medical">의료기기 (Medical Devices)</option>
                                                <option value="chemistry">화학제품 (Chemicals)</option>
                                                <option value="machinery">기계류 (Machinery)</option>
                                                <option value="textile">섬유/의류 (Textiles)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">수출 대상 국가</label>
                                            <select
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={globalFormData.targetCountry}
                                                onChange={(e) => setGlobalFormData({ ...globalFormData, targetCountry: e.target.value })}
                                            >
                                                <option value="USA">미국 (USA)</option>
                                                <option value="EU">유럽연합 (EU)</option>
                                                <option value="Japan">일본 (Japan)</option>
                                                <option value="China">중국 (China)</option>
                                                <option value="Vietnam">베트남 (Vietnam)</option>
                                                <option value="UK">영국 (UK)</option>
                                                <option value="Australia">호주 (Australia)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">제품 설명 (선택)</label>
                                            <input
                                                className="w-full rounded-md border border-zinc-300 px-4 py-2"
                                                value={globalFormData.description}
                                                onChange={e => setGlobalFormData({ ...globalFormData, description: e.target.value })}
                                                placeholder="예: 블루투스 기능을 포함한 가정용 조명기기"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={step === "analyzing"}
                                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                                        >
                                            {step === "analyzing" ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" /> 분석 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="h-5 w-5" /> 로드맵 생성하기
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-zinc-900">
                                            🇺🇸 {globalResult.target_country} 수출 로드맵
                                        </h3>
                                        <button
                                            onClick={() => setGlobalResult(null)}
                                            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900"
                                        >
                                            다른 국가 확인하기
                                        </button>
                                    </div>

                                    {/* Key Certifications */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-zinc-900 mb-4">
                                                <Shield className="h-5 w-5 text-indigo-600" /> 필수 인증 및 규제
                                            </h4>
                                            <ul className="space-y-3">
                                                {globalResult.key_certifications.map((cert, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                                                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cert.mandatory ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                                                            {cert.mandatory ? "!" : "?"}
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-sm text-zinc-900">{cert.name}</div>
                                                            <div className="text-xs text-zinc-500">{cert.description}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-zinc-900 mb-4">
                                                <Clock className="h-5 w-5 text-indigo-600" /> 예상 기간 및 비용
                                            </h4>
                                            <div className="space-y-4 text-sm">
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-zinc-600">규제 당국</span>
                                                    <span className="font-bold text-zinc-900">{globalResult.regulatory_authority}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-zinc-600">예상 소요 기간</span>
                                                    <span className="font-bold text-zinc-900">{globalResult.estimated_timeline}</span>
                                                </div>
                                                <div className="flex justify-between pb-2">
                                                    <span className="text-zinc-600">예상 비용 (추정)</span>
                                                    <span className="font-bold text-zinc-900">{globalResult.estimated_cost}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 rounded-lg bg-indigo-50 p-4 text-xs text-indigo-800">
                                                <strong>💡 통관 팁: </strong>
                                                {globalResult.customs_tips}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Process Steps */}
                                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                                        <h4 className="font-bold text-zinc-900 mb-4">단계별 진행 가이드</h4>
                                        <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6 pl-6 pb-2">
                                            {globalResult.process_steps.map((step, idx) => (
                                                <div key={idx} className="relative">
                                                    <span className="absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold border-2 border-white ring-2 ring-indigo-50">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-sm text-zinc-700 leading-relaxed font-medium pt-1">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Helper icon for map
    const scanIcon = (props: any) => <Cpu {...props} />;

    return (
        <div className="container mx-auto px-4 pb-20 pt-6">
            {mode === "hub" && <DiagnosticHub />}
            {mode === "detailed" && <DetailedGrid />}
            {mode === "general" && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
                    {/* Header with Back Button */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => {
                                setMode("hub");
                                setStep("input");
                                setResult(null);
                            }}
                            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" /> 규제 진단 홈
                        </button>
                    </div>

                    {step === "input" && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-zinc-900">종합 규제 진단</h1>
                                <p className="mt-2 text-zinc-600">
                                    제품의 기본 정보를 입력하여 AI 진단을 시작하세요.
                                </p>
                            </div>

                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl border bg-white p-8 shadow-sm"
                                onSubmit={handleGeneralSubmit}
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
                                            placeholder="제품의 주요 기능, 사용 재질, 배터리 포함 여부 등을 자세히 적어주세요."
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
                        </>
                    )}

                    {step === "analyzing" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <h2 className="mt-6 text-2xl font-bold">AI가 법령을 검토하고 있습니다...</h2>
                            <p className="mt-2 text-zinc-600">입력하신 &quot;{formData.productName}&quot;에 해당하는<br />전기안전법, 전파법, 어린이제품안전특별법 등을 스캔 중입니다.</p>
                        </div>
                    )}

                    {step === "generating_doc" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                            <h2 className="mt-6 text-2xl font-bold">AI가 문서를 작성하고 있습니다...</h2>
                            <p className="mt-2 text-zinc-600">
                                &quot;{generatingDocName}&quot; 초안을 생성 중입니다.<br />
                                약 10~20초 정도 소요될 수 있습니다.
                            </p>
                        </div>
                    )}

                    {step === "doc_result" && generatedDoc && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-zinc-900">📄 문서 초안 생성 완료</h2>
                                <button
                                    onClick={() => setStep("result")}
                                    className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline"
                                >
                                    결과 화면으로 돌아가기
                                </button>
                            </div>

                            <div className="rounded-xl border bg-white p-8 shadow-sm">
                                <div className="mb-6 flex items-center justify-between border-b pb-4">
                                    <h3 className="text-xl font-bold text-zinc-800">{generatedDoc.title}</h3>
                                    <button className="flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                                        <Download className="h-4 w-4" />
                                        다운로드 (Word)
                                    </button>
                                </div>
                                <div className="prose max-w-none whitespace-pre-wrap text-zinc-700">
                                    {generatedDoc.content}
                                </div>
                            </div>
                        </motion.div>
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
                                                <button
                                                    onClick={() => generateDocument(doc.name, doc.name)}
                                                    className="flex items-center gap-1 rounded bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                >
                                                    AI 자동작성 <ChevronRight className="h-3 w-3" />
                                                </button>
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
                                <button
                                    onClick={() => {
                                        setStep("input");
                                    }}
                                    className="px-6 py-2 font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                >
                                    입력 수정 / 재진단
                                </button>
                                <button className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white shadow hover:bg-blue-700">
                                    로드맵 저장 및 상담 신청
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
