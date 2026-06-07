"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, HelpCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportSheet } from "@/components/report/ReportSheet";
import { CorroboratePrompt, type NearbyMatch } from "@/components/report/CorroboratePrompt";
import { MapLegend } from "@/components/map/MapLegend";
import { SearchBar } from "@/components/map/SearchBar";
import { HowItWorks } from "@/components/onboarding/HowItWorks";
import { snapWaypoints, type SnapResult } from "@/lib/geo/snap";
import { getSessionId } from "@/lib/session";
import { fetchReports } from "@/app/actions";

type LngLat = [number, number];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const OVERLAP_THRESHOLD = 0.4;

export default function RoadMap({ initialData }: { initialData: GeoJSON.FeatureCollection }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const waypointsRef = useRef<LngLat[]>([]);
  const modeRef = useRef<"idle" | "drawing">("idle");

  const [ready, setReady] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [snapped, setSnapped] = useState<SnapResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [corrOpen, setCorrOpen] = useState(false);
  const [match, setMatch] = useState<NearbyMatch | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("br_seen_intro")) {
      setShowIntro(true);
    }
  }, []);

  const closeIntro = useCallback(() => {
    setShowIntro(false);
    if (typeof window !== "undefined") localStorage.setItem("br_seen_intro", "1");
  }, []);

  const setSource = useCallback((id: string, data: GeoJSON.GeoJSON) => {
    const src = mapRef.current?.getSource(id) as mapboxgl.GeoJSONSource | undefined;
    src?.setData(data);
  }, []);

  const refreshReports = useCallback(async () => {
    try {
      const fc = await fetchReports();
      setSource("reports", fc?.type ? fc : EMPTY);
    } catch {
      setSource("reports", EMPTY);
    }
  }, [setSource]);

  const updateDraftLine = useCallback(() => {
    const wp = waypointsRef.current;
    const data: GeoJSON.GeoJSON =
      wp.length >= 2
        ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: wp } }
        : EMPTY;
    setSource("draft", data);
  }, [setSource]);

  const clearDraftArtifacts = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    waypointsRef.current = [];
    setPointCount(0);
    modeRef.current = "idle";
    setDrawing(false);
    setSource("draft", EMPTY);
  }, [setSource]);

  const startDraw = useCallback(() => {
    clearDraftArtifacts();
    setSnapped(null);
    modeRef.current = "drawing";
    setDrawing(true);
    toast.info("Tap the start, bends, and end of the bad stretch. Then tap Done.");
  }, [clearDraftArtifacts]);

  const undo = useCallback(() => {
    waypointsRef.current.pop();
    markersRef.current.pop()?.remove();
    setPointCount(waypointsRef.current.length);
    updateDraftLine();
  }, [updateDraftLine]);

  const finishDraw = useCallback(async () => {
    const wp = waypointsRef.current;
    if (wp.length < 2) {
      toast.error("Tap at least two points along the road.");
      return;
    }
    if (!TOKEN) {
      toast.error("Map token missing - set NEXT_PUBLIC_MAPBOX_TOKEN.");
      return;
    }
    try {
      const result = await snapWaypoints(wp, TOKEN);
      setSnapped(result);
      setSource("draft", { type: "Feature", properties: {}, geometry: result.geometry });
      modeRef.current = "idle";
      setDrawing(false);

      const near = await fetch("/api/reports/near", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ geometry: result.geometry }),
      })
        .then((r) => (r.ok ? r.json() : { matches: [] }))
        .catch(() => ({ matches: [] }));

      const top: NearbyMatch | undefined = near.matches?.[0];
      if (top && (top.overlap_ratio ?? 0) >= OVERLAP_THRESHOLD) {
        setMatch(top);
        setCorrOpen(true);
      } else {
        setSheetOpen(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not snap to roads. Try again.");
    }
  }, [setSource]);

  const confirmMatch = useCallback(async () => {
    if (!match) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/reports/${match.id}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId() }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const { count } = await res.json();
      toast.success(`Confirmed - ${count} reports on this stretch.`);
      await refreshReports();
      setCorrOpen(false);
      setMatch(null);
      clearDraftArtifacts();
      setSnapped(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not confirm.");
    } finally {
      setConfirming(false);
    }
  }, [match, refreshReports, clearDraftArtifacts]);

  const reportNewFromCorr = useCallback(() => {
    setCorrOpen(false);
    setSheetOpen(true);
  }, []);

  const onSearchSelect = useCallback((center: [number, number]) => {
    mapRef.current?.flyTo({ center, zoom: 15, duration: 1200, essential: true });
  }, []);

  const onSubmitted = useCallback(async () => {
    await refreshReports();
    clearDraftArtifacts();
  }, [refreshReports, clearDraftArtifacts]);

  // Map init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716],
      zoom: 11,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );
    containerRef.current
      .querySelector(".mapboxgl-ctrl-geolocate")
      ?.setAttribute("title", "Center the map on you. Your location stays on your device.");
    mapRef.current = map;

    map.on("load", () => {
      const widthExpr: mapboxgl.ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "corroborations"], 0],
        0, 4,
        50, 12,
      ];

      map.addSource("reports", { type: "geojson", data: initialData ?? EMPTY });
      // White casing so the colored lines stay legible over the detailed street map.
      map.addLayer({
        id: "reports-casing",
        type: "line",
        source: "reports",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["+", widthExpr, 3],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "reports-line",
        type: "line",
        source: "reports",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": widthExpr,
          "line-color": [
            "match",
            ["get", "severity"],
            1, "#f59e0b",
            2, "#f97316",
            3, "#dc2626",
            "#9ca3af",
          ],
          "line-opacity": 1,
        },
      });

      map.addSource("draft", { type: "geojson", data: EMPTY });
      map.addLayer({
        id: "draft-line",
        type: "line",
        source: "draft",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#18181b", "line-width": 4, "line-dasharray": [1.4, 1] },
      });

      setReady(true);
    });

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (modeRef.current !== "drawing") return;
      const lngLat: LngLat = [e.lngLat.lng, e.lngLat.lat];
      waypointsRef.current.push(lngLat);
      const marker = new mapboxgl.Marker({ color: "#18181b", scale: 0.65 }).setLngLat(lngLat).addTo(map);
      markersRef.current.push(marker);
      setPointCount(waypointsRef.current.length);
      updateDraftLine();
    };
    map.on("click", onClick);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [refreshReports, updateDraftLine, initialData]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />

      {/* Masthead */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto inline-block overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm backdrop-blur">
          <div className="h-1.5 bg-primary" />
          <div className="px-4 py-2.5">
            <h1 className="font-display text-base font-extrabold leading-none tracking-tight sm:text-lg">
              Fix Bengaluru Roads
            </h1>
            <p className="label-caps mt-1.5 text-muted-foreground">
              Citizen road map for Bengaluru
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur transition-colors hover:bg-muted"
          >
            <BarChart3 className="size-4" strokeWidth={2} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowIntro(true)}
            aria-label="How it works"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur transition-colors hover:bg-muted"
          >
            <HelpCircle className="size-4" strokeWidth={2} />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </div>
      </header>

      {/* Place search */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center px-3 lg:top-4">
        <div className="pointer-events-auto w-full max-w-md">
          <SearchBar onSelect={onSearchSelect} />
        </div>
      </div>

      <MapLegend />

      {/* Action dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4 sm:p-6">
        {!drawing ? (
          <Button
            size="lg"
            disabled={!ready}
            onClick={startDraw}
            className="pointer-events-auto h-12 gap-2 rounded-full px-6 text-[0.95rem] font-semibold shadow-xl shadow-foreground/15 transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add a bad road
          </Button>
        ) : (
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            <p className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow-md">
              Tap along the bad stretch &middot; {pointCount} point{pointCount === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={undo} disabled={pointCount === 0}>
                Undo
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={clearDraftArtifacts}>
                Cancel
              </Button>
              <Button size="sm" className="rounded-full px-5" onClick={finishDraw} disabled={pointCount < 2}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      <HowItWorks open={showIntro} onClose={closeIntro} />
      <ReportSheet open={sheetOpen} onOpenChange={setSheetOpen} snapped={snapped} onSubmitted={onSubmitted} />
      <CorroboratePrompt
        open={corrOpen}
        onOpenChange={setCorrOpen}
        match={match}
        confirming={confirming}
        onConfirm={confirmMatch}
        onReportNew={reportNewFromCorr}
      />
    </div>
  );
}
