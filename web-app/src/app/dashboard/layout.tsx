import Link from "next/link";
import { BarChart, FileText, Home, Settings, ShieldCheck } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <ShieldCheck className="h-6 w-6" />
                        <span>Certi-Mate</span>
                    </Link>
                </div>
                <nav className="space-y-1 p-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <Home className="h-5 w-5" />
                        <span className="font-medium">대시보드</span>
                    </Link>
                    <Link
                        href="/dashboard/diagnostic"
                        className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100"
                    >
                        <BarChart className="h-5 w-5" />
                        <span className="font-medium">규제 진단</span>
                    </Link>
                    <Link
                        href="/dashboard/documents"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">내 문서함</span>
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">설정</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
