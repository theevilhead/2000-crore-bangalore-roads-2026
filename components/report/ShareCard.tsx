"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SEVERITY_META, type Severity } from "@/lib/types";
import { formatLength } from "@/lib/format";
import { staticMapUrl } from "@/lib/geo/staticMap";
import { reportUrl, whatsappShareUrl } from "@/lib/share";

export function ShareCard({
  id,
  geometry,
  severity,
  lengthM,
  onDone,
}: {
  id: string;
  geometry: GeoJSON.LineString;
  severity: Severity;
  lengthM: number;
  onDone: () => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const img = token ? staticMapUrl(geometry, token, 600, 315) : null;
  const url = reportUrl(id);
  const meta = SEVERITY_META[severity];
  const shareText = `Flagged a ${meta.label.toLowerCase()} ${formatLength(lengthM)} stretch in Bengaluru that needs fixing. Add yours:`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl border border-border">
        {img ? (
          <Image src={img} alt="Reported stretch" width={600} height={315} className="h-auto w-full" unoptimized />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Map preview needs a Mapbox token
          </div>
        )}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label} &middot; {formatLength(lengthM)}
        </span>
      </div>

      <p className="text-[0.95rem] leading-snug">
        <span className="font-display font-bold">On the map.</span> Share it so your
        neighbours can back it up — more reports push it up the list.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          nativeButton={false}
          className="h-12 w-full rounded-full text-[0.95rem] font-semibold"
          render={<a href={whatsappShareUrl(shareText, url)} target="_blank" rel="noopener noreferrer" />}
        >
          Share on WhatsApp
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="h-11 flex-1 rounded-full" onClick={copy}>
            Copy link
          </Button>
          <Button variant="ghost" size="lg" className="h-11 flex-1 rounded-full" onClick={onDone}>
            Report another
          </Button>
        </div>
      </div>
    </div>
  );
}
