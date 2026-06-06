import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const bodySchema = z.object({
  geometry: z.object({ type: z.literal("LineString"), coordinates: z.array(position).min(2) }),
  bufferM: z.number().positive().max(200).default(25),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("nearby_reports", {
    p_geojson: parsed.data.geometry,
    buffer_m: parsed.data.bufferM,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data ?? [] });
}
