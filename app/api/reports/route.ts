import { NextResponse } from "next/server";
import { newReportSchema } from "@/lib/schema";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = newReportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const r = parsed.data;
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("create_report", {
    p_geojson: r.geometry,
    p_severity: r.severity,
    p_damage_types: r.damageTypes,
    p_note: r.note ?? null,
    p_session_id: r.sessionId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data }, { status: 201 });
}

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("reports_geojson");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
