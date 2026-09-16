export const LOAD_GREEN_BELOW_MS = 2500;
export const LOAD_ORANGE_BELOW_MS = 5000;

export function formatSeconds(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  return `${(ms / 1000).toFixed(1)} s`;
}

export function loadColorClass(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "border-gray-200 bg-gray-50 text-gray-400";
  if (ms < LOAD_GREEN_BELOW_MS) return "border-green-500 bg-green-50 text-green-600";
  if (ms < LOAD_ORANGE_BELOW_MS) return "border-orange-500 bg-orange-50 text-orange-600";
  return "border-red-500 bg-red-50 text-red-600";
}

export type RegionGroup = "United States" | "Europe" | "Other";

export function regionGroup(region: string): RegionGroup {
  if (region.startsWith("us-")) return "United States";
  if (region.startsWith("europe-")) return "Europe";
  return "Other";
}

export function probeAge(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "never";
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return `${Math.max(minutes, 0)} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
