// GSC search analytics data lags ~2 days behind real time; ranges that
// include the missing days would render misleading zero-points.
const GSC_DATA_LAG_DAYS = 2;

function toYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function buildGscDateRange(
  days: 7 | 28 | 90,
  today: Date = new Date(),
): { startDate: string; endDate: string } {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - GSC_DATA_LAG_DAYS);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: toYMD(start), endDate: toYMD(end) };
}
