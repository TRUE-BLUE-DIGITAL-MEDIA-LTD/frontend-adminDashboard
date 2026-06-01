import type { AdjustLeadRate } from "../../services/adjust-lead-rate";

const currencySymbols: Record<string, string> = { USD: "$", THB: "฿" };

/**
 * Format a rate for the partner matrix: currency symbol + value.
 * Whole numbers show no decimals (5 -> $5); fractional values show two
 * decimals (2.4 -> $2.40, 0.75 -> $0.75). Unknown currencies fall back to
 * "<CODE> <value>".
 */
export function formatRate(rate: AdjustLeadRate): string {
  const symbol =
    currencySymbols[rate.convertedCurrency] ?? `${rate.convertedCurrency} `;
  const value = Number.isInteger(rate.rate)
    ? String(rate.rate)
    : rate.rate.toFixed(2);
  return `${symbol}${value}`;
}
