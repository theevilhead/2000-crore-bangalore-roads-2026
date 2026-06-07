import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your data & privacy - Fix Bengaluru Roads",
  description:
    "Plain-language summary of what this project stores, what stays on your device, and what is public.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight">Your data &amp; privacy</h1>
        <p className="text-muted-foreground">
          No login, no accounts, no ads. We collect the least we can to build an honest map of
          Bengaluru&apos;s bad roads. Here is exactly what that means.
        </p>
      </header>

      <Section title="What we store when you flag a stretch">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The road line you draw, snapped to the road network, and its length.</li>
          <li>The severity you pick, plus any optional issue tags, the optional 1-10 condition, and any note you add.</li>
          <li>The date and time of the report.</li>
          <li>
            An <strong>anonymous device id</strong>: a random code saved in your browser and attached
            to your report and to any stretch you confirm. It lets us limit spam and double-voting. It
            is not your name, email, or phone, and is not linked to who you are.
          </li>
          <li>
            The ward / area is worked out from the location of the road you drew (to help prioritise) -
            not from your device.
          </li>
        </ul>
      </Section>

      <Section title='What "Use my location" does'>
        <p>
          The location button asks your browser for your position so the map can center on you. This
          happens on your device. We do <strong>not</strong> store or send your live location to our
          servers. The permission is yours: you can allow it once, and revoke it anytime in your
          browser settings.
        </p>
      </Section>

      <Section title="What is public">
        <p>
          Reports are meant to be seen. Each one appears on the public map and has a shareable link
          showing its location, length, severity, issue tags, and condition score. Treat anything you
          submit as public, and please do not put personal information (names, phone numbers, vehicle
          numbers) in the note. Notes are stored but are not shown publicly today; that could change.
        </p>
      </Section>

      <Section title="What we do not collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No accounts or passwords.</li>
          <li>No advertising, and we do not sell your data. (We do use Google Analytics for aggregate usage; see below.)</li>
          <li>No photos in this version. If photos are added later, we plan to blur faces and number plates.</li>
        </ul>
      </Section>

      <Section title="Services we rely on">
        <p>To run the map we send some data to a few providers:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <strong>Mapbox</strong> draws the map, snaps the points you tap to roads, and renders the
            shareable map image. The points you tap and your current map view are sent to Mapbox for
            this.
          </li>
          <li>
            <strong>Supabase</strong> hosts the database where reports are stored.
          </li>
          <li>
            <strong>Vercel</strong> hosts the app.
          </li>
          <li>
            <strong>Google Analytics</strong> measures aggregate usage (such as which pages are
            visited and rough device / location) so we can understand how the site is used and improve
            it. It sets cookies. We use it for aggregate insight, not to identify you, and we do not run
            ads. You can opt out with Google&apos;s browser add-on or your browser&apos;s cookie
            controls. (Only active where the site owner has enabled it.)
          </li>
        </ul>
        <p className="mt-2">
          As part of normal operation and security, these providers may process technical data such as
          IP addresses. The app also stores a small cache on your device so it loads faster.
        </p>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Clear your browser&apos;s site data to reset your anonymous device id.</li>
          <li>
            To ask for a report to be removed, contact the maintainers (see the project page). We will
            take down anything inaccurate or inappropriate.
          </li>
        </ul>
      </Section>

      <Section title="As the project grows">
        <p>
          This is an early version and will change. For example, we may later add phone verification to
          strengthen trust; if we do, a phone number would be stored in a hashed form, and this page
          will be updated to say so. This project is run in the public interest.
        </p>
      </Section>

      <p className="border-t border-border pt-6 text-xs text-muted-foreground">
        Last updated 7 June 2026. This is a plain-language summary, not a formal legal document.
      </p>
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
