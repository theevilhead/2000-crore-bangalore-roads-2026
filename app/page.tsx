"use client";

import dynamic from "next/dynamic";

// Mapbox GL touches `window`, so load the map client-side only.
const RoadMap = dynamic(() => import("@/components/map/RoadMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function Home() {
  return <RoadMap />;
}
