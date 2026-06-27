import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import {
    deleteDiagnostic,
    insertDiagnostic,
    listDiagnostics,
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
        const toolType = searchParams.get("tool_type");
        const limit = Number(searchParams.get("limit") || "100");

        const rows = await listDiagnostics(user.id, {
            limit,
            toolType: toolType === "null" ? null : toolType || undefined,
        });

        const diagnostics = rows.map((row) => ({
            ...row,
            result_json: JSON.parse(row.result_json),
        }));

        return NextResponse.json({ diagnostics });
    } catch (error) {
        console.error("List diagnostics error:", error);
        return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        const body = (await req.json()) as {
            userId?: string;
            product_name?: string;
            productName?: string;
            category?: string;
            description?: string | null;
            result_json?: unknown;
            resultJson?: unknown;
            tool_type?: string | null;
            toolType?: string | null;
        };

        const productName = body.product_name || body.productName;
        const category = body.category;
        if (!productName || !category) {
            return NextResponse.json({ error: "product_name과 category가 필요합니다." }, { status: 400 });
        }

        const id = await insertDiagnostic({
            userId: user?.id ?? body.userId ?? null,
            productName,
            category,
            description: body.description ?? null,
            resultJson: body.result_json ?? body.resultJson ?? {},
            toolType: body.tool_type ?? body.toolType ?? null,
        });

        return NextResponse.json({ id });
    } catch (error) {
        console.error("Insert diagnostic error:", error);
        return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
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

        const ok = await deleteDiagnostic(id, user.id);
        if (!ok) {
            return NextResponse.json({ error: "삭제할 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete diagnostic error:", error);
        return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
