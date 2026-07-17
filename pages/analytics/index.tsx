import {
  Button,
  Checkbox,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { useMemo, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import CompareTable from "../../components/analytics/CompareTable";
import {
  RangePreset,
  rangeForCustom,
  rangeForPreset,
} from "../../components/analytics/date-range";
import {
  formatDurationMs,
  formatPct,
  formatReturningPct,
  SortKey,
  sortRows,
} from "../../components/analytics/format";
import LanderDetailPanel from "../../components/analytics/LanderDetailPanel";
import DashboardLayout from "../../layouts/dashboardLayout";
import { LanderAnalyticsRow, User } from "../../models";
import { ListLanderAnalyticsService } from "../../services/admin/analytics";
import { GetUser } from "../../services/admin/user";

const PRESET_OPTIONS: { label: string; value: RangePreset | "custom" }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

const PAGE_SIZE = 50;

function Index({ user }: { user: User }) {
  const [preset, setPreset] = useState<RangePreset | "custom">("30d");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"landers" | "domains">("landers");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  const range = useMemo(() => {
    if (preset === "custom") return rangeForCustom(customFrom, customTo);
    return rangeForPreset(preset);
  }, [preset, customFrom, customTo]);

  const analytics = useQuery({
    queryKey: ["lander-analytics", range?.from, range?.to],
    queryFn: () =>
      ListLanderAnalyticsService({ from: range!.from, to: range!.to }),
    enabled: !!range,
  });

  const rows = useMemo(() => {
    const allRows = analytics.data?.rows ?? [];
    const term = search.trim().toLowerCase();
    const filtered = term
      ? allRows.filter(
          (row) =>
            (row.landingPageName ?? "").toLowerCase().includes(term) ||
            (row.domainName ?? "").toLowerCase().includes(term),
        )
      : allRows;
    return sortRows(filtered, sortKey, sortDir);
  }, [analytics.data, search, sortKey, sortDir]);
  const totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allRows = analytics.data?.rows ?? [];
  const compareRows = allRows.filter((r) => compareIds.includes(r.landingPageId));
  const compareCrossDomain =
    new Set(compareRows.map((r) => r.domainId ?? r.landingPageId)).size > 1;

  const domainGroups = useMemo(() => {
    const groups = new Map<
      string,
      { domainId: string; domainName: string; rows: LanderAnalyticsRow[] }
    >();
    for (const row of allRows) {
      if (!row.domainId) continue;
      const g = groups.get(row.domainId) ?? {
        domainId: row.domainId,
        domainName: row.domainName ?? row.domainId,
        rows: [],
      };
      g.rows.push(row);
      groups.set(row.domainId, g);
    }
    return [...groups.values()].sort(
      (a, b) =>
        b.rows.reduce((s, r) => s + r.views, 0) -
        a.rows.reduce((s, r) => s + r.views, 0),
    );
  }, [allRows]);
  const selectedDomain =
    domainGroups.find((g) => g.domainId === selectedDomainId) ?? null;

  const toggleCompare = (id: string) =>
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const header = (key: SortKey, label: string) => (
    <TableCell
      onClick={() => {
        if (sortKey === key) {
          setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
          setSortKey(key);
          setSortDir("desc");
        }
        setPage(1);
      }}
      className="cursor-pointer select-none font-semibold"
    >
      {label} {sortKey === key ? (sortDir === "desc" ? "▼" : "▲") : ""}
    </TableCell>
  );

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen w-full p-5 pt-24 font-Poppins">
        <h1 className="text-2xl font-bold">Lander Analytics</h1>
        <p className="text-sm text-gray-500">
          Views, clicks, and bounce rate per landing page. Bounce = visitors
          who never clicked the main button.
        </p>

        <div className="my-4 flex flex-wrap items-center gap-3">
          <Select
            size="small"
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value as RangePreset | "custom");
              setPage(1);
            }}
          >
            {PRESET_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          {preset === "custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 p-2"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 p-2"
              />
            </>
          )}
          <Select
            size="small"
            value={view}
            onChange={(e) => setView(e.target.value as "landers" | "domains")}
          >
            <MenuItem value="landers">Landers</MenuItem>
            <MenuItem value="domains">By domain</MenuItem>
          </Select>
          <SearchField
            className="relative flex w-80 items-center"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          >
            <Input
              placeholder="Search lander or domain"
              className="w-full rounded-md border border-gray-300 p-2 pl-10"
            />
            <IoSearchCircleSharp className="absolute left-2 text-2xl text-gray-400" />
          </SearchField>
        </div>

        {preset === "custom" && !range && (
          <p className="text-sm text-amber-600">
            Pick a valid from/to date to load data.
          </p>
        )}

        {analytics.isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : view === "domains" ? (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Domain</TableCell>
                  <TableCell className="font-semibold">Landers</TableCell>
                  <TableCell className="font-semibold">Views</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domainGroups.map((g) => (
                  <TableRow
                    key={g.domainId}
                    hover
                    className="cursor-pointer"
                    selected={selectedDomainId === g.domainId}
                    onClick={() =>
                      setSelectedDomainId((s) =>
                        s === g.domainId ? null : g.domainId,
                      )
                    }
                  >
                    <TableCell>{g.domainName}</TableCell>
                    <TableCell>{g.rows.length}</TableCell>
                    <TableCell>
                      {g.rows.reduce((s, r) => s + r.views, 0)}
                    </TableCell>
                  </TableRow>
                ))}
                {domainGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No visits recorded in this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {selectedDomain && (
              <CompareTable rows={selectedDomain.rows} crossDomain={false} />
            )}
          </>
        ) : (
          <>
            {compareRows.length >= 2 && (
              <CompareTable rows={compareRows} crossDomain={compareCrossDomain} />
            )}
            {compareIds.length > 0 && (
              <Button size="small" onClick={() => setCompareIds([])}>
                Clear selection ({compareIds.length})
              </Button>
            )}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell className="font-semibold">Lander</TableCell>
                  <TableCell className="font-semibold">Domain</TableCell>
                  {header("views", "Views")}
                  {header("clicks", "Clicks")}
                  {header("ctr", "CR")}
                  {header("bounceRate", "Bounce")}
                  <TableCell className="font-semibold">Returning</TableCell>
                  {header("avgTimeOnPageMs", "Avg time")}
                  {header("avgMaxScrollPct", "Avg scroll")}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow
                    key={row.landingPageId}
                    hover
                    className="cursor-pointer"
                    selected={selected === row.landingPageId}
                    onClick={() =>
                      setSelected((s) =>
                        s === row.landingPageId ? null : row.landingPageId,
                      )
                    }
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={compareIds.includes(row.landingPageId)}
                        onChange={() => toggleCompare(row.landingPageId)}
                      />
                    </TableCell>
                    <TableCell>{row.landingPageName ?? row.landingPageId}</TableCell>
                    <TableCell>{row.domainName ?? "—"}</TableCell>
                    <TableCell>{row.views}</TableCell>
                    <TableCell>{row.clicks}</TableCell>
                    <TableCell>{formatPct(row.ctr)}</TableCell>
                    <TableCell>{formatPct(row.bounceRate)}</TableCell>
                    <TableCell>
                      {formatReturningPct(row.returningViews, row.identifiedViews)}
                    </TableCell>
                    <TableCell>{formatDurationMs(row.avgTimeOnPageMs)}</TableCell>
                    <TableCell>
                      {row.avgMaxScrollPct === null ? "—" : `${row.avgMaxScrollPct}%`}
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500">
                      No visits recorded in this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                />
              </div>
            )}
            {selected && range && (
              <LanderDetailPanel
                landingPageId={selected}
                from={range.from}
                to={range.to}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    if (user.TOTPenable === false) {
      return {
        redirect: { permanent: false, destination: "/auth/setup-totp" },
      };
    }
    return { props: { user } };
  } catch (err) {
    return {
      redirect: { permanent: false, destination: "https://home.oxyclick.com" },
    };
  }
};
