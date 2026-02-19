export default function DocumentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">내 문서함</h1>
            <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                <p className="text-zinc-500">
                    아직 저장된 문구가 없습니다.
                    <br />
                    규제 진단 후 생성된 문서는 여기에 보관됩니다.
                </p>
            </div>
        </div>
    );
}
