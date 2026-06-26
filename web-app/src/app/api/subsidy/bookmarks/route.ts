import { NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: Request) {
    const supabase = createSupabaseFromRequest(req);
    if (!supabase) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("subsidy_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("bookmarked_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookmarks: data || [] });
}

export async function POST(req: Request) {
    const supabase = createSupabaseFromRequest(req);
    if (!supabase) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const { announcement_id, source, title, official_url, deadline, deadline_status } = body;

    if (!announcement_id || !source || !title) {
        return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("subsidy_bookmarks")
        .upsert({
            user_id: user.id,
            announcement_id,
            source,
            title,
            official_url: official_url || null,
            deadline: deadline || null,
            deadline_status: deadline_status || "unknown",
            remind_deadline: true,
        }, { onConflict: "user_id,source,announcement_id" })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookmark: data });
}

export async function DELETE(req: Request) {
    const supabase = createSupabaseFromRequest(req);
    if (!supabase) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const announcement_id = searchParams.get("announcement_id");
    const source = searchParams.get("source");

    if (!announcement_id || !source) {
        return NextResponse.json({ error: "announcement_id와 source가 필요합니다." }, { status: 400 });
    }

    const { error } = await supabase
        .from("subsidy_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("announcement_id", announcement_id)
        .eq("source", source);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
