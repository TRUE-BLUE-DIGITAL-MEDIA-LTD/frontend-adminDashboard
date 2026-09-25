import type { LanderAnalyticsRow } from "../../models";
import {
  formatDurationMs,
  formatPct,
  formatReturningPct,
} from "./format";
import { crSignificance, Significance } from "./significance";

const BADGE_STYLES: Record<Significance, string> = {
  significant: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  "not-significant": "border-line bg-panel-raised text-fg-muted",
  insufficient: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};
const BADGE_LABELS: Record<Significance, string> = {
  significant: "significant",
  "not-significant": "not yet significant",
  insufficient: "needs more data",
};

export default function CompareTable({
  rows,
  crossDomain,
}: {
  rows: LanderAnalyticsRow[];
  crossDomain: boolean;
}) {
  if (rows.length < 2) return null;
  const leader = rows.reduce((best, r) => (r.ctr > best.ctr ? r : best), rows[0]);
  const sorted = [...rows].sort((a, b) => b.ctr - a.ctr);

  return (
    <div className="rounded-xl border border-line bg-surface/30 p-4">
      <h2 className="text-lg font-semibold tracking-tight text-fg">
        Landing page comparison
      </h2>
      {crossDomain ? (
        <p className="mb-3 mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Cross-domain comparison — traffic sources differ, this is not a
          controlled A/B test.
        </p>
      ) : (
        <p className="mb-3 mt-1 text-sm text-fg-subtle">
          Same domain, same period — traffic is split by weight, so this is a
          true A/B comparison. Significance is tested against the CR leader.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
              <th className="px-3 py-2.5 font-semibold">Lander</th>
              <th className="px-3 py-2.5 font-semibold">Domain</th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Current split
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">Views</th>
              <th className="px-3 py-2.5 text-right font-semibold">Clicks</th>
              <th className="px-3 py-2.5 text-right font-semibold">CR</th>
              <th className="px-3 py-2.5 text-right font-semibold">Bounce</th>
              <th className="px-3 py-2.5 text-right font-semibold">Avg time</th>
              <th className="px-3 py-2.5 text-right font-semibold">Avg scroll</th>
              <th className="px-3 py-2.5 text-right font-semibold">Returning</th>
              <th className="px-3 py-2.5 font-semibold">vs leader</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isLeader = row.landingPageId === leader.landingPageId;
              const sig = isLeader ? null : crSignificance(leader, row);
              return (
                <tr
                  key={row.landingPageId}
                  className={`border-b border-line ${
                    isLeader ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-fg">
                      {row.landingPageName ?? row.landingPageId}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-fg-muted">
                    {row.domainName ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {row.percent === null ? "—" : `${row.percent}%`}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {row.views}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {row.clicks}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      isLeader
                        ? "font-semibold text-emerald-300"
                        : "text-fg-muted"
                    }`}
                  >
                    {formatPct(row.ctr)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {formatPct(row.bounceRate)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {formatDurationMs(row.avgTimeOnPageMs)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {row.avgMaxScrollPct === null
                      ? "—"
                      : `${row.avgMaxScrollPct}%`}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">
                    {formatReturningPct(row.returningViews, row.identifiedViews)}
                  </td>
                  <td className="px-3 py-2.5">
                    {isLeader ? (
                      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        leader
                      </span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${BADGE_STYLES[sig!]}`}
                      >
                        {BADGE_LABELS[sig!]}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}