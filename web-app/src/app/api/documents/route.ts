import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import {
    countDiagnostics,
    countDocuments,
    deleteDocument,
    listDocuments,
    resolveDocumentContent,
} from "@/lib/db/repository";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode");

        if (mode === "stats") {
            const [diagnosticCount, documentCount] = await Promise.all([
                countDiagnostics(user.id),
                countDocuments(user.id),
            ]);
            return NextResponse.json({ diagnosticCount, documentCount });
        }

        const docs = await listDocuments(user.id);
        const documents = await Promise.all(
            docs.map(async (doc) => ({
                ...doc,
                content: await resolveDocumentContent(doc),
            }))
        );

        return NextResponse.json({ documents });
    } catch (error) {
        console.error("Documents GET error:", error);
        return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
        }

        const ok = await deleteDocument(id, user.id);
        if (!ok) {
            return NextResponse.json({ error: "삭제할 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Documents DELETE error:", error);
        return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
