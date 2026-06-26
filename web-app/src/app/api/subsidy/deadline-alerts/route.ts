import { NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: Request) {
    const supabase = createSupabaseFromRequest(req);
    if (!supabase) {
        return NextResponse.json({ alerts: [] });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ alerts: [] });
    }

    const { data, error } = await supabase
        .from("subsidy_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .eq("remind_deadline", true)
        .in("deadline_status", ["closing_soon", "open"])
        .order("bookmarked_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const alerts = (data || []).filter(
        (b) => b.deadline_status === "closing_soon"
    );

    return NextResponse.json({
        alerts,
        total_bookmarks: data?.length || 0,
    });
}
