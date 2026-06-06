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
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border">
        {img ? (
          <Image src={img} alt="Reported stretch" width={600} height={315} className="h-auto w-full" unoptimized />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Map preview needs a Mapbox token
          </div>
        )}
      </div>
      <p className="text-sm">
        Thanks - your report is on the map.{" "}
        <span className="font-medium" style={{ color: meta.color }}>
          {meta.label}
        </span>{" "}
        · {formatLength(lengthM)}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          render={<a href={whatsappShareUrl(shareText, url)} target="_blank" rel="noopener noreferrer" />}
        >
          Share on WhatsApp
        </Button>
        <Button variant="outline" size="lg" onClick={copy}>
          Copy link
        </Button>
        <Button variant="ghost" size="lg" onClick={onDone}>
          Report another
        </Button>
      </div>
    </div>
  );
}
