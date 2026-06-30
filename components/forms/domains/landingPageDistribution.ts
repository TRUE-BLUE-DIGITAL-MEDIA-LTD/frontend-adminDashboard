export interface LandingPagePercent {
  percent: number;
}

/**
 * Sum the percent values of the linked landing pages. Non-finite values
 * (e.g. NaN from an empty input field) count as 0 so the running total
 * stays a real number.
 */
export function sumLandingPagePercent(
  landingPages: LandingPagePercent[],
): number {
  return landingPages.reduce(
    (total, page) =>
      total + (Number.isFinite(page.percent) ? page.percent : 0),
    0,
  );
}

/**
 * A domain's landing-page distribution is valid when it has no linked pages,
 * or when the percentages total exactly 100% (within a small float tolerance).
 */
export function isLandingPageDistributionValid(
  landingPages: LandingPagePercent[],
): boolean {
  if (landingPages.length === 0) return true;
  return Math.abs(sumLandingPagePercent(landingPages) - 100) < 0.01;
}