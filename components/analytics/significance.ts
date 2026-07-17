export type Significance = "significant" | "not-significant" | "insufficient";

const MIN_CLICKS = 30;
const MIN_VIEWS = 200;
const Z_95 = 1.96; // two-sided, alpha = 0.05

// Two-proportion z-test on conversion rates (pooled standard error).
// "significant" means the CR difference between a and b is unlikely to be
// random at 95% confidence. Below the sample floors the test is meaningless,
// so we report "insufficient" instead of a verdict.
export function crSignificance(
  a: { clicks: number; views: number },
  b: { clicks: number; views: number },
): Significance {
  if (
    a.views < MIN_VIEWS ||
    b.views < MIN_VIEWS ||
    a.clicks < MIN_CLICKS ||
    b.clicks < MIN_CLICKS
  ) {
    return "insufficient";
  }
  const p1 = a.clicks / a.views;
  const p2 = b.clicks / b.views;
  const pooled = (a.clicks + b.clicks) / (a.views + b.views);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.views + 1 / b.views));
  if (!Number.isFinite(se) || se === 0) return "insufficient";
  const z = Math.abs(p1 - p2) / se;
  return z >= Z_95 ? "significant" : "not-significant";
}
