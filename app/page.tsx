import { MapApp } from "@/components/map/MapApp";
import { getReportsGeoJSON } from "@/lib/reports-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await getReportsGeoJSON();
  return <MapApp initialData={initialData} />;
}
