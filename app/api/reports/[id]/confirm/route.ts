import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionId } = await req.json().catch(() => ({ sessionId: null }));
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const sb = supabaseServer();
  const { error } = await sb
    .from("corroborations")
    .upsert(
      { report_id: id, session_id: sessionId },
      { onConflict: "report_id,session_id", ignoreDuplicates: true }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count } = await sb
    .from("corroborations")
    .select("*", { count: "exact", head: true })
    .eq("report_id", id);
  return NextResponse.json({ count: count ?? 0 });
}
