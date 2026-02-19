"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FileText, Download, Copy, X, Loader2, Calendar, FileType, Zap, CheckCircle, ChevronRight, AlertCircle, Trash2, RefreshCw, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

interface GeneratedDocument {
    type: 'document';
    id: string;
    diagnostic_id: string | null;
    title: string;
    doc_type: string;
    content: string;
    created_at: string;
    status: string;
}

interface DiagnosticResultItem {
    type: 'diagnostic';
    id: string;
    product_name: string;
    tool_type: string; // 'general', 'label', 'global'
    result_json: any; // The structured JSON result
    created_at: string;
}

interface GroupedItem {
    subject: string;
    items: CombinedItem[];
    latest_at: string;
}

type CombinedItem = GeneratedDocument | DiagnosticResultItem;

export default function DocumentsPage() {
    const router = useRouter();
    const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<GroupedItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<CombinedItem | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const supabase = createSupabaseClient();

            // 1. Fetch Diagnostic Results First (to use as grouping labels)
            const { data: diagnostics, error: diagError } = await (supabase as any)
                .from("diagnostic_results")
                .select("*")
                .order("created_at", { ascending: false });

            if (diagError) console.error("Error fetching diagnostics:", diagError);

            // 2. Fetch Generated Documents
            const { data: documents, error: docError } = await (supabase as any)
                .from("documents")
                .select("*")
                .order("created_at", { ascending: false });

            if (docError) console.error("Error fetching documents:", docError);

            // 3. Create Lookup for Diagnostics
            const diagMap = new Map<string, string>();
            if (diagnostics) {
                diagnostics.forEach((d: any) => diagMap.set(d.id, d.product_name));
            }

            const groups: { [key: string]: CombinedItem[] } = {};

            // Helper to add to groups
            const addToGroup = (subject: string, item: CombinedItem) => {
                const cleanSubject = subject || "미분류 항목";
                if (!groups[cleanSubject]) groups[cleanSubject] = [];
                groups[cleanSubject].push(item);
            };

            if (diagnostics) {
                diagnostics.forEach((diag: any) => {
                    addToGroup(diag.product_name, {
                        type: 'diagnostic',
                        id: diag.id,
                        product_name: diag.product_name,
                        tool_type: diag.tool_type || 'general',
                        result_json: diag.result_json,
                        created_at: diag.created_at
                    });
                });
            }

            if (documents) {
                documents.forEach((doc: any) => {
                    // Try to link to a diagnostic's product name
                    let subject = "";
                    if (doc.diagnostic_id && diagMap.has(doc.diagnostic_id)) {
                        subject = diagMap.get(doc.diagnostic_id)!;
                    } else {
                        // Guess from title or just use title
                        // For display, use the document title as standalone subject if not linked
                        subject = doc.title.split(' ').slice(0, 2).join(' '); // Tentative simple matching
                    }

                    addToGroup(subject, {
                        type: 'document',
                        id: doc.id,
                        diagnostic_id: doc.diagnostic_id,
                        title: doc.title,
                        doc_type: doc.doc_type,
                        content: doc.content,
                        created_at: doc.created_at,
                        status: doc.status
                    });
                });
            }

            // Convert to array and sort groups by latest item's date
            const groupedList: GroupedItem[] = Object.keys(groups).map(subject => ({
                subject,
                items: groups[subject].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
                latest_at: groups[subject].reduce((max, item) =>
                    new Date(item.created_at).getTime() > new Date(max).getTime() ? item.created_at : max,
                    groups[subject][0].created_at)
            }));

            groupedList.sort((a, b) => new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime());

            setGroupedItems(groupedList);

        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!selectedItem) return;
        let textToCopy = "";

        if (selectedItem.type === 'document') {
            textToCopy = selectedItem.content;
        } else {
            // For diagnostic result, copy a summary
            textToCopy = JSON.stringify(selectedItem.result_json, null, 2);
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        if (!selectedItem) return;

        let content = "";
        let filename = "";

        if (selectedItem.type === 'document') {
            content = selectedItem.content;
            filename = `${selectedItem.title.replace(/\s+/g, "_")}.md`;
        } else {
            content = JSON.stringify(selectedItem.result_json, null, 2);
            filename = `${selectedItem.product_name.replace(/\s+/g, "_")}_diagnostic.json`;
        }

        const element = document.createElement("a");
        const file = new Blob([content], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        if (!confirm("정말 이 항목을 삭제하시겠습니까?")) return;

        try {
            setIsDeleting(true);
            const supabase = createSupabaseClient();
            const table = selectedItem.type === 'document' ? 'documents' : 'diagnostic_results';

            const { error } = await (supabase as any)
                .from(table)
                .delete()
                .eq('id', selectedItem.id);

            if (error) throw error;

            // Remove from local state
            if (selectedGroup) {
                const updatedItems = selectedGroup.items.filter(i => i.id !== selectedItem.id);
                if (updatedItems.length === 0) {
                    setGroupedItems(prev => prev.filter(g => g.subject !== selectedGroup.subject));
                    setSelectedGroup(null);
                } else {
                    const updatedGroup = { ...selectedGroup, items: updatedItems };
                    setSelectedGroup(updatedGroup);
                    setGroupedItems(prev => prev.map(g => g.subject === selectedGroup.subject ? updatedGroup : g));
                }
            }

            setSelectedItem(null);
            alert("정상적으로 삭제되었습니다.");
            fetchData(); // Force refresh from server to confirm deletion
        } catch (err) {
            console.error("Delete error:", err);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditAndRediagnose = () => {
        if (!selectedItem || selectedItem.type !== 'diagnostic') return;
        router.push(`/dashboard/diagnostic?id=${selectedItem.id}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // --- Render Content Logic ---
    const renderDetailContent = (item: CombinedItem) => {
        if (item.type === 'document') {
            return (
                <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:text-zinc-900 prose-p:text-zinc-600 prose-li:text-zinc-600">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700">
                        {item.content}
                    </pre>
                </div>
            );
        } else {
            // Render Diagnostic Result (Structured)
            const result = item.result_json;
            if (!result) return <div className="text-zinc-500">데이터가 손상되었습니다.</div>;

            return (
                <div className="space-y-6">
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
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">1. 필수 인증 항목</h3>
                            <ul className="space-y-3">
                                {result.certifications && result.certifications.length > 0 ? (
                                    result.certifications.map((cert: any, index: number) => (
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
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
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
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">3. 다음 단계 (서류 준비)</h3>
                        <div className="overflow-hidden rounded-lg border">
                            <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                                <span className="font-medium">필요 서류 목록</span>
                                <span className="text-sm text-zinc-500">{result.required_documents?.length || 0}개 항목</span>
                            </div>
                            <div className="divide-y">
                                {result.required_documents && result.required_documents.map((doc: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-zinc-400" />
                                            <div>
                                                <span className="block font-medium text-zinc-900">{doc.name}</span>
                                                <span className="text-xs text-zinc-500">{doc.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">내 문서함</h1>
                    <p className="text-zinc-500 mt-1">AI가 생성한 문서 및 규제 진단 리포트를 확인하세요.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    새로고침
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : groupedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
                        <FileText className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900">아직 저장된 항목이 없습니다</h3>
                    <p className="mt-2 text-zinc-500 text-sm">
                        규제 진단을 완료하고 필요한 문서를 생성해보세요.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedItems.map((group) => (
                        <motion.div
                            key={group.subject}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
                            onClick={() => setSelectedGroup(group)}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-lg p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                                        기록 {group.items.length}건
                                    </span>
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                                {group.subject}
                            </h3>
                            <p className="text-sm text-zinc-500 line-clamp-1 mb-4">
                                {group.items[0].type === 'diagnostic' ? group.items[0].product_name : group.items[0].title} 외...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-4 border-t pt-4">
                                <Calendar className="h-3 w-3" />
                                <span>최근 업데이트: {formatDate(group.latest_at)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Group Detail Modal (History List) */}
            <AnimatePresence>
                {selectedGroup && !selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedGroup(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b px-6 py-4 bg-zinc-50">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">{selectedGroup.subject} 이력</h2>
                                    <p className="text-sm text-zinc-500">생성된 진단 리포트 및 문서를 확인하세요.</p>
                                </div>
                                <button onClick={() => setSelectedGroup(null)} className="rounded-full p-2 hover:bg-zinc-200">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {selectedGroup.items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50 hover:border-blue-300 hover:bg-white cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${item.type === 'diagnostic' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {item.type === 'diagnostic' ? <Zap className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                                                    {item.type === 'diagnostic' ? '규제 진단 리포트' : item.title}
                                                </h4>
                                                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" /> {formatDate(item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Item Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedItem(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4 bg-zinc-50/50 backdrop-blur-sm sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">
                                        {selectedItem.type === 'document' ? selectedItem.title : selectedItem.product_name}
                                    </h2>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                            ${selectedItem.type === 'diagnostic' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {selectedItem.type === 'document' ? selectedItem.doc_type : '규제 진단 리포트'}
                                        </span>
                                        <span className="text-zinc-300">|</span>
                                        <span>{formatDate(selectedItem.created_at)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-6 sm:p-8">
                                <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-zinc-100 min-h-full">
                                    {renderDetailContent(selectedItem)}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t bg-white px-6 py-4 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>삭제</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    {selectedItem.type === 'diagnostic' && (
                                        <button
                                            onClick={handleEditAndRediagnose}
                                            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            <span>수정 및 재진단</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                    >
                                        {copySuccess ? (
                                            <>
                                                <span className="text-green-600">복사 완료!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span>{selectedItem.type === 'document' ? '내용 복사' : 'JSON 복사'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>{selectedItem.type === 'document' ? '다운로드 (.md)' : '다운로드 (.json)'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
