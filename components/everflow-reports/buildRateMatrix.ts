import type { AdjustLeadRate } from "../../services/adjust-lead-rate";

export interface RateMatrix {
  countries: string[];
  campaignIds: string[];
  cell: (country: string, campaignId: string) => AdjustLeadRate | undefined;
}

const slotKey = (r: AdjustLeadRate) => `${r.country}|${r.campaignId}`;

const startTime = (r: AdjustLeadRate) =>
  r.startDate ? new Date(r.startDate).getTime() : -Infinity;

/**
 * Pick the single rate to display for one (country, campaignId) group.
 * Most recent startDate wins (an always-active rate has no startDate and ranks
 * lowest, so a live temp always beats it); among rates sharing the same
 * startDate, prefer targetCurrency "USD" (the EUR/USD pair collapses to USD);
 * then id for determinism. Inputs are already partner-effective (only
 * non-ended temps + visible always-active rates).
 */
function pickRate(group: AdjustLeadRate[]): AdjustLeadRate {
  return [...group].sort((a, b) => {
    const at = startTime(a);
    const bt = startTime(b);
    if (at !== bt) return bt - at;
    const aUsd = a.targetCurrency === "USD" ? 0 : 1;
    const bUsd = b.targetCurrency === "USD" ? 0 : 1;
    if (aUsd !== bUsd) return aUsd - bUsd;
    return a.id.localeCompare(b.id);
  })[0];
}

/**
 * Pivot the (already partner-effective, currency-filtered) rate list into a
 * country x campaign matrix with one rate per cell.
 */
export function buildRateMatrix(rates: AdjustLeadRate[]): RateMatrix {
  const groups = new Map<string, AdjustLeadRate[]>();
  const countrySet = new Set<string>();
  const campaignSet = new Set<string>();

  for (const r of rates) {
    countrySet.add(r.country);
    campaignSet.add(r.campaignId);
    const key = slotKey(r);
    const existing = groups.get(key);
    if (existing) existing.push(r);
    else groups.set(key, [r]);
  }

  const selected = new Map<string, AdjustLeadRate>();
  for (const [key, group] of groups) {
    selected.set(key, pickRate(group));
  }

  return {
    countries: [...countrySet].sort((a, b) => a.localeCompare(b)),
    campaignIds: [...campaignSet],
    cell: (country, campaignId) => selected.get(`${country}|${campaignId}`),
  };
}
