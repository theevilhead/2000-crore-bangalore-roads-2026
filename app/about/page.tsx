import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About - Fix Bengaluru Roads",
  description:
    "What this project is: a citizen map to help Bengaluru's Rs 2,000 crore road relaying reach the roads that need it most.",
};

const ARTICLES = [
  {
    source: "Swarajya",
    title: "Cabinet clears Rs 2,000 crore road upgrade for Bengaluru",
    href: "https://swarajyamag.com/news-brief/cm-shivakumars-first-cabinet-clears-rs-2000-crore-road-upgrade-for-bengaluru-pushes-urban-reforms",
  },
  {
    source: "Deccan Herald",
    title: "Rs 2,000 crore road-relaying push for Bengaluru",
    href: "https://www.deccanherald.com/india/karnataka/bengaluru/rs-2000-crore-road-relaying-push-ahead-of-gba-polls-4027959",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:py-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="label-caps text-muted-foreground hover:text-foreground">
          Fix Bengaluru Roads
        </Link>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Back to the map
        </Link>
      </div>

      <header className="flex flex-col gap-2">
        <span className="h-1.5 w-16 rounded-full bg-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">About this project</h1>
        <p className="text-muted-foreground">
          A citizen-built map to make sure Bengaluru&apos;s road repair money reaches the roads that
          actually need it.
        </p>
      </header>

      <Section title="The Rs 2,000 crore road relaying">
        <p>
          In 2026, the Karnataka government approved roughly{" "}
          <strong className="text-foreground">Rs 2,000 crore</strong> to relay and upgrade Bengaluru&apos;s
          roads. It is a large sum and a real chance to fix the city&apos;s worst stretches, if the work
          reaches the right roads.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {ARTICLES.map((a) => (
            <a
              key={a.href}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 transition-colors hover:bg-muted/50"
            >
              <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="leading-snug">
                <span className="font-medium text-foreground">{a.title}</span>
                <span className="block text-xs text-muted-foreground">{a.source}</span>
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Why a map, not just pothole photos">
        <p>
          A pothole photo shows one spot. Roads fail in <em>stretches</em>. Here you trace the whole bad
          stretch on the map; it snaps to the real road and measures its length. You mark how bad it is
          and, if you like, how it compares to the well-kept roads around Cubbon Park. When other people
          flag the same stretch, it climbs the list, so the worst, most-felt roads rise to the top.
        </p>
      </Section>

      <Section title="What it is for">
        <p>
          The aim is a clear, shared, public picture of where Bengaluru&apos;s roads are broken and how
          badly, useful to residents, to the press, and to the agencies doing the work. Over time we want
          to track what actually gets relaid against what citizens flagged, and show the gap.
        </p>
      </Section>

      <Section title="Open and free">
        <p>
          No login, no ads, open to everyone. See{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">
            what we store
          </Link>{" "}
          for how your data is handled.
        </p>
      </Section>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          Flag a road
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 font-medium"
        >
          See the dashboard
        </Link>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="text-[0.95rem] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
