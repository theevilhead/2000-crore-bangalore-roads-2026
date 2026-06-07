import { NextResponse } from "next/server";
import { newReportSchema } from "@/lib/schema";
import { supabaseServer } from "@/lib/supabase/server";
import { verifyCaptcha } from "@/lib/turnstile";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const captchaOk = await verifyCaptcha(json?.captchaToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: "Captcha verification failed" }, { status: 403 });
  }

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
    p_condition: r.condition ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data }, { status: 201 });
}

// No public GET: report data is server-rendered into the map and the dashboard
// reads aggregates only. There is no bulk JSON endpoint to scrape.
