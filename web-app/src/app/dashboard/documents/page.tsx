"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "../../../lib/supabaseClient";
import { FileText, Download, Copy, X, Loader2, Calendar, FileType } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
    id: string;
    title: string;
    doc_type: string;
    content: string;
    created_at: string;
    status: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching documents:", error);
            } else {
                setDocuments(data || []);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!selectedDoc) return;
        try {
            await navigator.clipboard.writeText(selectedDoc.content);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        if (!selectedDoc) return;
        const element = document.createElement("a");
        const file = new Blob([selectedDoc.content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = `${selectedDoc.title.replace(/\s+/g, "_")}.md`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">내 문서함</h1>
                    <p className="text-zinc-500 mt-1">AI가 생성한 모든 문서를 확인하고 관리하세요.</p>
                </div>
                <button
                    onClick={fetchDocuments}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    새로고침
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
                        <FileText className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900">아직 저장된 문서가 없습니다</h3>
                    <p className="mt-2 text-zinc-500 text-sm">
                        규제 진단을 완료하고 필요한 문서를 생성해보세요.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                            onClick={() => setSelectedDoc(doc)}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                                    {doc.status === 'draft' ? '초안' : '완료'}
                                </span>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4 border-t pt-4">
                                <span className="flex items-center gap-1">
                                    <FileType className="h-3 w-3" />
                                    {doc.doc_type}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(doc.created_at)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Document Detail Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedDoc(null)}
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
                                    <h2 className="text-xl font-bold text-zinc-900">{selectedDoc.title}</h2>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                                            {selectedDoc.doc_type}
                                        </span>
                                        <span className="text-zinc-300">|</span>
                                        <span>{formatDate(selectedDoc.created_at)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-6 sm:p-8">
                                <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-zinc-100 min-h-full">
                                    <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:text-zinc-900 prose-p:text-zinc-600 prose-li:text-zinc-600">
                                        {/* Simple formatting for markdown content - could use react-markdown later */}
                                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700">
                                            {selectedDoc.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t bg-white px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
                                            <span>내용 복사</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>다운로드 (.md)</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
