import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getReportFeature } from "@/lib/reports";
import { SEVERITY_META, DAMAGE_TYPE_LABELS } from "@/lib/types";
import { formatLength } from "@/lib/format";
import { staticMapUrl } from "@/lib/geo/staticMap";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportFeature(id);
  if (!report) return { title: "Report not found" };
  const meta = SEVERITY_META[report.severity];
  const title = `${meta.label} road stretch (${formatLength(report.lengthM)}) - Bengaluru`;
  const description = `A ${meta.label.toLowerCase()} ${formatLength(report.lengthM)} stretch flagged for relaying. ${report.corroborations + 1} reports.`;
  const image = TOKEN ? staticMapUrl(report.geometry, TOKEN, 1200, 630) : undefined;
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportFeature(id);
  if (!report) notFound();

  const meta = SEVERITY_META[report.severity];
  const img = TOKEN ? staticMapUrl(report.geometry, TOKEN, 1200, 630) : null;
  const reports = report.corroborations + 1;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 p-5">
      <div className="overflow-hidden rounded-xl border">
        {img ? (
          <Image src={img} alt="Reported road stretch" width={1200} height={630} className="h-auto w-full" unoptimized />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Map preview needs a Mapbox token
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: meta.color }} />
          <h1 className="text-lg font-semibold">
            {meta.label} stretch · {formatLength(report.lengthM)}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{meta.help}</p>
        <p className="text-sm">
          {reports} {reports === 1 ? "report" : "reports"} on this stretch.
        </p>
        {report.damageTypes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {report.damageTypes.map((d) => DAMAGE_TYPE_LABELS[d]).join(" · ")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" render={<Link href="/" />}>
          Open the map
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        A citizen project to help Bengaluru&apos;s road relaying reach the worst stretches. Non-partisan, no logins.
      </p>
    </main>
  );
}
