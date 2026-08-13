// Payout figures arrive from the API already converted into `currency`
// (the partner's payment currency); this only renders the label.
export function formatPayout(payout: number, currency?: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(payout);
  } catch {
    // Unknown or malformed code from the API: keep the historical format.
    return (
      "$" +
      payout.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
}
