"use client";

import Link from "next/link";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-bold">Certi-Mate</span>
                            <span className="text-[10px] font-medium text-zinc-500">(주)와우쓰리디</span>
                        </div>
                    </Link>
                    <Link href="/" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                        <ChevronLeft className="h-4 w-4" /> 홈으로 돌아가기
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
                >
                    <div className="bg-zinc-900 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">이용약관</h1>
                        <p className="mt-2 text-zinc-400">시행일: 2024년 2월 20일</p>
                    </div>

                    <div className="p-8 prose prose-zinc max-w-none text-zinc-600 leading-relaxed">
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 1 조 (목적)</h2>
                            <p>이 약관은 (주)와우쓰리디(이하 "회사")가 운영하는 'Certi-Mate'(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 2 조 (용어의 정의)</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>"서비스"란 회사가 제공하는 AI 기반 규제 진단, 서류 자동 생성 및 관련 부가 서비스를 의미합니다.</li>
                                <li>"이용자"란 회사에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                                <li>"회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 3 조 (약관의 명시와 개정)</h2>
                            <p>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 시행일자 및 개정사유를 명시하여 현행약관과 함께 공지합니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 4 조 (서비스의 제공 및 변경)</h2>
                            <p>서비스는 AI 기술을 기반으로 정보를 제공하며, 이는 참고용입니다. 회사는 기술적 사양의 변경이나 시장 상황의 변화에 따라 서비스의 내용을 변경할 수 있습니다. AI가 생성한 결과물에 대한 최종 검토 책임은 이용자에게 있습니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 5 조 (회사의 의무)</h2>
                            <p>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는 데 최선을 다하여야 합니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">제 6 조 (이용자의 의무)</h2>
                            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>신청 또는 변경 시 허위 내용의 등록</li>
                                <li>타인의 정보 도용</li>
                                <li>회사가 게시한 정보의 변경</li>
                                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                            </ul>
                        </section>

                        <div className="mt-12 pt-8 border-t border-zinc-100 text-sm text-zinc-400">
                            본 약관에 관한 궁금한 점은 <a href="mailto:wow3d16@naver.com" className="text-blue-600 hover:underline">wow3d16@naver.com</a>으로 문의해 주시기 바랍니다.
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 text-center text-zinc-400 text-sm">
                    &copy; 2024 (주)와우쓰리디. All rights reserved.
                </div>
            </div>
        </div>
    );
}
