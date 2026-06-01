import type { AdjustLeadRate } from "../../services/adjust-lead-rate";

export interface ComputeDisplayRatesArgs {
  rates: AdjustLeadRate[] | undefined;
  canSeeHistory: boolean;
  viewMode: "active" | "history";
  now: Date;
}

/**
 * Returns the rates to display in AdjustLeadRatesTable.
 *
 * A temporary rate (one carrying startDate/endDate) that is currently within
 * its window ("live") replaces the always-active rate sharing the same slot:
 *   country + campaignId + targetCurrency + convertedCurrency.
 *
 * - Partner/user (canSeeHistory=false): live temps + always-active rates not
 *   covered by a live temp. No upcoming, no ended.
 * - Admin/manager (canSeeHistory=true), active view: all always-active rates
 *   (never hidden) + all non-ended temps (live + upcoming). History view:
 *   ended temps only.
 * Assumes startDate/endDate, when present, are valid ISO date strings from the API.
 */
export function computeDisplayRates({
  rates,
  canSeeHistory,
  viewMode,
  now,
}: ComputeDisplayRatesArgs): AdjustLeadRate[] {
  if (!rates) return [];

  const keyOf = (r: AdjustLeadRate) =>
    `${r.country}|${r.campaignId}|${r.targetCurrency}|${r.convertedCurrency}`;
  const hasSchedule = (r: AdjustLeadRate) => Boolean(r.startDate || r.endDate);
  const isEnded = (r: AdjustLeadRate) =>
    Boolean(r.endDate) && new Date(r.endDate as string) < now;
  const isLive = (r: AdjustLeadRate) =>
    hasSchedule(r) &&
    !isEnded(r) &&
    (!r.startDate || new Date(r.startDate) <= now);
  const isFuture = (r: AdjustLeadRate) =>
    Boolean(r.startDate) && new Date(r.startDate as string) > now;

  // History view is only reachable for canSeeHistory roles.
  if (canSeeHistory && viewMode === "history") {
    return rates.filter(isEnded);
  }

  const liveTemps = rates.filter(isLive);
  const liveKeys = new Set(liveTemps.map(keyOf));
  const alwaysActiveVisible = rates.filter(
    (r) => !hasSchedule(r) && !liveKeys.has(keyOf(r)),
  );

  if (!canSeeHistory) {
    return [...liveTemps, ...alwaysActiveVisible];
  }

  const futureTemps = rates.filter(isFuture);
  // Admin/manager active view: full visibility — every always-active rate
  // (never hidden by a live temp) plus all non-ended temps.
  const allAlwaysActive = rates.filter((r) => !hasSchedule(r));
  return [...liveTemps, ...futureTemps, ...allAlwaysActive];
}
