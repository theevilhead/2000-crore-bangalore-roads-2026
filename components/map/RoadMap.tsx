"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReportSheet } from "@/components/report/ReportSheet";
import { CorroboratePrompt, type NearbyMatch } from "@/components/report/CorroboratePrompt";
import { MapLegend } from "@/components/map/MapLegend";
import { snapWaypoints, type SnapResult } from "@/lib/geo/snap";
import { getSessionId } from "@/lib/session";

type LngLat = [number, number];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const OVERLAP_THRESHOLD = 0.4;

export default function RoadMap() {
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

  const setSource = useCallback((id: string, data: GeoJSON.GeoJSON) => {
    const src = mapRef.current?.getSource(id) as mapboxgl.GeoJSONSource | undefined;
    src?.setData(data);
  }, []);

  const refreshReports = useCallback(async () => {
    try {
      const fc = await fetch("/api/reports").then((r) => (r.ok ? r.json() : EMPTY));
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
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("reports", { type: "geojson", data: EMPTY });
      map.addLayer({
        id: "reports-line",
        type: "line",
        source: "reports",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "corroborations"], 0],
            0, 3,
            50, 11,
          ],
          "line-color": [
            "match",
            ["get", "severity"],
            1, "#f59e0b",
            2, "#f97316",
            3, "#dc2626",
            "#9ca3af",
          ],
          "line-opacity": 0.85,
        },
      });

      map.addSource("draft", { type: "geojson", data: EMPTY });
      map.addLayer({
        id: "draft-line",
        type: "line",
        source: "draft",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#2563eb", "line-width": 4, "line-dasharray": [1.5, 1] },
      });

      setReady(true);
      void refreshReports();
    });

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (modeRef.current !== "drawing") return;
      const lngLat: LngLat = [e.lngLat.lng, e.lngLat.lat];
      waypointsRef.current.push(lngLat);
      const marker = new mapboxgl.Marker({ color: "#2563eb", scale: 0.7 }).setLngLat(lngLat).addTo(map);
      markersRef.current.push(marker);
      setPointCount(waypointsRef.current.length);
      updateDraftLine();
    };
    map.on("click", onClick);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [refreshReports, updateDraftLine]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
        <div className="pointer-events-auto rounded-full border bg-background/90 px-4 py-2 shadow-sm backdrop-blur">
          <h1 className="text-sm font-semibold">Fix Bengaluru Roads</h1>
          <p className="text-xs text-muted-foreground">Map the bad stretches. Help the relaying work hit the right roads.</p>
        </div>
      </header>

      <MapLegend />

      {/* Action dock */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
        {!drawing ? (
          <Button size="lg" className="rounded-full shadow-lg" disabled={!ready} onClick={startDraw}>
            + Add a bad road
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border bg-background/95 p-1.5 shadow-lg backdrop-blur">
            <span className="px-2 text-sm text-muted-foreground">{pointCount} point{pointCount === 1 ? "" : "s"}</span>
            <Button variant="ghost" size="sm" onClick={undo} disabled={pointCount === 0}>
              Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={clearDraftArtifacts}>
              Cancel
            </Button>
            <Button size="sm" onClick={finishDraw} disabled={pointCount < 2}>
              Done
            </Button>
          </div>
        )}
      </div>

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
