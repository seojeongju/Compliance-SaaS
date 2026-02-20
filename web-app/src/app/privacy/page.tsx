"use client";

import Link from "next/link";
import { ShieldCheck, ChevronLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
                    <div className="bg-blue-600 px-8 py-10 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Lock className="h-6 w-6 opacity-80" />
                            <h1 className="text-3xl font-bold">개인정보 처리방침</h1>
                        </div>
                        <p className="mt-2 text-blue-100 italic">사용자의 개인정보를 안전하게 보호하며, 법규를 준수합니다.</p>
                        <p className="mt-4 text-xs opacity-70">최종 수정일: 2024년 2월 20일</p>
                    </div>

                    <div className="p-8 prose prose-zinc max-w-none text-zinc-600 leading-relaxed">
                        <section className="mb-10 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">개인정보 처리방침 요약</h2>
                            <p className="mb-4">회사는 이용자의 개인정보를 중요하게 생각하며 아래와 같이 보호하고 있습니다.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-zinc-200">
                                    <span className="font-bold text-blue-600 block mb-1">수집 목적</span>
                                    서비스 제공, 회원 관리, AI 진단 결과 저장 및 맞춤 서비스 제공
                                </div>
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-zinc-200">
                                    <span className="font-bold text-blue-600 block mb-1">보유 기간</span>
                                    회원 탈퇴 시까지 또는 법정 보유 기간 동안
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">1. 수집하는 개인정보 항목</h2>
                            <p>회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집할 수 있습니다.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>이메일 주소, 비밀번호, 성명</li>
                                <li>서비스 이용 기록, 진단 결과 데이터, 접속 로그</li>
                                <li>회사명, 대표자명, 사업장 주소 (기업 회원 활성화 시)</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">2. 개인정보의 이용 목적</h2>
                            <p>수집한 개인정보는 다음의 목적을 위해 활용합니다.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                                <li>회원 관리 및 본인 확인</li>
                                <li>AI 기반 규제 진단 서비스 제공 및 결과 데이터 관리</li>
                                <li>신규 서비스 개발 및 마케팅 활용</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">3. 개인정보의 보유 및 이용기간</h2>
                            <p>회사는 이용자가 회원자격을 유지하고 있는 동안 개인정보를 보유하며, 회원 탈퇴 시 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">4. 개인정보의 제3자 제공</h2>
                            <p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 mb-4">5. 이용자의 권리 및 그 행사방법</h2>
                            <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.</p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-zinc-100 text-sm text-zinc-400">
                            개인정보 보호와 관련된 문의사항은 <a href="mailto:wow3d16@naver.com" className="text-blue-600 hover:underline">wow3d16@naver.com</a>으로 연락 주시기 바랍니다.
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
