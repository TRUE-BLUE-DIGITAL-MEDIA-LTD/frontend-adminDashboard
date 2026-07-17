import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import type { LanderAnalyticsRow } from "../../models";
import {
  formatDurationMs,
  formatPct,
  formatReturningPct,
} from "./format";
import { crSignificance, Significance } from "./significance";

const BADGE_STYLES: Record<Significance, string> = {
  significant: "bg-red-100 text-red-700",
  "not-significant": "bg-gray-100 text-gray-600",
  insufficient: "bg-amber-50 text-amber-700",
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
    <div className="my-6 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-bold">Landing page comparison</h2>
      {crossDomain ? (
        <p className="mb-2 text-sm text-amber-600">
          Cross-domain comparison — traffic sources differ, this is not a
          controlled A/B test.
        </p>
      ) : (
        <p className="mb-2 text-sm text-gray-500">
          Same domain, same period — traffic is split by weight, so this is a
          true A/B comparison. Significance is tested against the CR leader.
        </p>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className="font-semibold">Lander</TableCell>
            <TableCell className="font-semibold">Domain</TableCell>
            <TableCell className="font-semibold">Current split</TableCell>
            <TableCell className="font-semibold">Views</TableCell>
            <TableCell className="font-semibold">Clicks</TableCell>
            <TableCell className="font-semibold">CR</TableCell>
            <TableCell className="font-semibold">Bounce</TableCell>
            <TableCell className="font-semibold">Avg time</TableCell>
            <TableCell className="font-semibold">Avg scroll</TableCell>
            <TableCell className="font-semibold">Returning</TableCell>
            <TableCell className="font-semibold">vs leader</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((row) => {
            const isLeader = row.landingPageId === leader.landingPageId;
            const sig = isLeader ? null : crSignificance(leader, row);
            return (
              <TableRow
                key={row.landingPageId}
                className={isLeader ? "bg-green-50" : ""}
              >
                <TableCell>{row.landingPageName ?? row.landingPageId}</TableCell>
                <TableCell>{row.domainName ?? "—"}</TableCell>
                <TableCell>
                  {row.percent === null ? "—" : `${row.percent}%`}
                </TableCell>
                <TableCell>{row.views}</TableCell>
                <TableCell>{row.clicks}</TableCell>
                <TableCell className={isLeader ? "font-bold" : ""}>
                  {formatPct(row.ctr)}
                </TableCell>
                <TableCell>{formatPct(row.bounceRate)}</TableCell>
                <TableCell>{formatDurationMs(row.avgTimeOnPageMs)}</TableCell>
                <TableCell>
                  {row.avgMaxScrollPct === null ? "—" : `${row.avgMaxScrollPct}%`}
                </TableCell>
                <TableCell>
                  {formatReturningPct(row.returningViews, row.identifiedViews)}
                </TableCell>
                <TableCell>
                  {isLeader ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      leader
                    </span>
                  ) : (
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${BADGE_STYLES[sig!]}`}
                    >
                      {BADGE_LABELS[sig!]}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
