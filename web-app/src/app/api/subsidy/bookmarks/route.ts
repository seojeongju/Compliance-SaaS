import { NextResponse } from "next/server";
import { requireDb } from "@/lib/cloudflare";
import { getUserFromRequest } from "@/lib/auth";
import { deleteBookmark, listBookmarks, upsertBookmark } from "@/lib/db/subsidy-db";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
        }

        const bookmarks = await listBookmarks(user.id);
        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error("Bookmarks GET error:", error);
        return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = requireDb();
        const user = await getUserFromRequest(req, db);
        if (!user) {
            return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
        }

        const body = (await req.json()) as {
            announcement_id?: string;
            source?: string;
            title?: string;
            official_url?: string | null;
            deadline?: string | null;
            deadline_status?: string;
        };
        const { announcement_id, source, title, official_url, deadline, deadline_status } = body;

        if (!announcement_id || !source || !title) {
            return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
        }

        const bookmark = await upsertBookmark(user.id, {
            announcement_id,
            source,
            title,
            official_url,
            deadline,
            deadline_status,
        });

        return NextResponse.json({ bookmark });
    } catch (error) {
        console.error("Bookmarks POST error:", error);
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
        const announcement_id = searchParams.get("announcement_id");
        const source = searchParams.get("source");

        if (!announcement_id || !source) {
            return NextResponse.json({ error: "announcement_id와 source가 필요합니다." }, { status: 400 });
        }

        await deleteBookmark(user.id, announcement_id, source);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Bookmarks DELETE error:", error);
        return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
