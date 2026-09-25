import {
  Checkbox,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { useEffect, useMemo, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { FiSearch, FiX } from "react-icons/fi";
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

const paginationSx = {
  "& .MuiPaginationItem-root": { color: "rgb(var(--fg))" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "var(--hover)",
  },
  "& .MuiPaginationItem-icon": { color: "rgb(var(--fg))" },
};

const checkboxSx = {
  color: "rgb(var(--fg-subtle))",
  "&.Mui-checked": { color: "#00ABE4" },
  "&.MuiCheckbox-indeterminate": { color: "#00ABE4" },
  "&.Mui-disabled": { color: "var(--line-strong)" },
};

const selectSx = {
  color: "rgb(var(--fg))",
  fontSize: "0.875rem",
  borderRadius: "9999px",
  backgroundColor: "rgb(var(--surface) / 0.4)",
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line)",
    borderRadius: "9999px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line-strong)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#00ABE4",
  },
  ".MuiSvgIcon-root": { color: "rgb(var(--fg-muted))" },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: "rgb(var(--panel))",
      color: "rgb(var(--fg))",
      border: "1px solid var(--line)",
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        "&:hover": { bgcolor: "var(--hover)" },
        "&.Mui-selected": {
          bgcolor: "rgba(0,171,228,0.15)",
          "&:hover": { bgcolor: "rgba(0,171,228,0.25)" },
        },
      },
    },
  },
};

const dateInputClass =
  "rounded-full border border-line bg-surface/40 px-3 py-1.5 text-sm text-fg outline-none focus:border-main-color";

function Index({ user }: { user: User }) {
  const [preset, setPreset] = useState<RangePreset | "custom">("today");
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

  // "Today" is live: refetch every 5s and leave `to` open so the server uses
  // its own "now" — a pinned `to` would exclude sessions newer than the moment
  // the preset was picked.
  const isLive = preset === "today";

  // Modal behavior for the detail popup: Esc closes, and the page behind
  // must not scroll while it is open.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const analytics = useQuery({
    queryKey: ["lander-analytics", preset, range?.from, range?.to],
    queryFn: () =>
      ListLanderAnalyticsService(
        isLive ? { from: range!.from } : { from: range!.from, to: range!.to },
      ),
    enabled: !!range,
    refetchInterval: isLive ? 5000 : false,
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
  const compareRows = allRows.filter((r) =>
    compareIds.includes(r.landingPageId),
  );
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

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sortCaret = (key: SortKey) =>
    sortKey === key ? (
      <span className="ml-1 text-main-color">
        {sortDir === "desc" ? "▼" : "▲"}
      </span>
    ) : null;

  const thSort = (key: SortKey, label: string, extraClass = "") => (
    <th
      key={key}
      onClick={() => onSort(key)}
      className={`cursor-pointer select-none px-3 py-3 font-semibold ${extraClass}`}
    >
      {label}
      {sortCaret(key)}
    </th>
  );

  return (
    <DashboardLayout user={user}>
      <main className="flex min-h-screen w-full flex-col items-center bg-surface p-3 font-Poppins text-fg sm:p-5">
        <section className="w-full max-w-7xl overflow-hidden rounded-2xl border border-line bg-panel text-fg">
          {/* Toolbar */}
          <header className="flex flex-col gap-4 border-b border-line px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-main-color">
                Analytics
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">
                Lander Analytics
              </h1>
              <p className="text-sm text-fg-subtle">
                Views, clicks, and bounce rate per landing page. Bounce =
                visitors who never clicked the main button.
              </p>
            </div>
          </header>

          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
            <Select
              size="small"
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value as RangePreset | "custom");
                setPage(1);
              }}
              className="min-w-[140px]"
              sx={selectSx}
              MenuProps={selectMenuProps}
            >
              {PRESET_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>

            {preset === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setPage(1);
                  }}
                  className={dateInputClass}
                />
                <span className="text-sm text-fg-subtle">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setPage(1);
                  }}
                  className={dateInputClass}
                />
              </div>
            )}

            <div className="inline-flex rounded-full border border-line bg-surface/40 p-1">
              <button
                type="button"
                onClick={() => setView("landers")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  view === "landers"
                    ? "bg-main-color/20 text-main-color"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Landers
              </button>
              <button
                type="button"
                onClick={() => setView("domains")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  view === "domains"
                    ? "bg-main-color/20 text-main-color"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                By domain
              </button>
            </div>

            <SearchField
              aria-label="Search lander or domain"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-1.5 text-fg sm:max-w-xs"
            >
              <FiSearch className="shrink-0 text-fg-subtle" size={16} />
              <Input
                placeholder="Search lander or domain"
                className="w-full bg-transparent py-0.5 text-sm text-fg outline-none placeholder:text-fg-subtle"
              />
            </SearchField>
          </div>

          {preset === "custom" && !range && (
            <p className="px-4 py-2 text-sm text-amber-300 sm:px-5">
              Pick a valid from/to date to load data.
            </p>
          )}

          {view === "domains" ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                  <thead className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                      <th className="px-4 py-3 font-semibold sm:px-5">
                        Domain
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Landers
                      </th>
                      <th className="px-4 py-3 text-right font-semibold sm:px-5">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.isLoading &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr
                          key={i}
                          className="animate-pulse border-b border-line"
                        >
                          <td className="px-4 py-4 sm:px-5">
                            <div className="h-3 w-40 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="ml-auto h-3 w-8 rounded bg-panel-raised" />
                          </td>
                          <td className="px-4 py-4 sm:px-5">
                            <div className="ml-auto h-3 w-12 rounded bg-panel-raised" />
                          </td>
                        </tr>
                      ))}

                    {!analytics.isLoading && domainGroups.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-16 text-center text-sm text-fg-subtle"
                        >
                          No visits recorded in this period.
                        </td>
                      </tr>
                    )}

                    {!analytics.isLoading &&
                      domainGroups.map((g) => (
                        <tr
                          key={g.domainId}
                          className={`cursor-pointer border-b border-line transition hover:bg-hover ${
                            selectedDomainId === g.domainId
                              ? "bg-main-color/10"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedDomainId((s) =>
                              s === g.domainId ? null : g.domainId,
                            )
                          }
                        >
                          <td className="px-4 py-3.5 sm:px-5">
                            <p className="truncate font-medium text-fg">
                              {g.domainName}
                            </p>
                          </td>
                          <td className="px-3 py-3.5 text-right tabular-nums text-fg-muted">
                            {g.rows.length}
                          </td>
                          <td className="px-4 py-3.5 text-right tabular-nums text-fg-muted sm:px-5">
                            {g.rows.reduce((s, r) => s + r.views, 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {selectedDomain && (
                <div className="border-t border-line px-4 py-4 sm:px-5">
                  <CompareTable
                    rows={selectedDomain.rows}
                    crossDomain={false}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {compareRows.length >= 2 && (
                <div className="border-b border-line px-4 py-4 sm:px-5">
                  <CompareTable
                    rows={compareRows}
                    crossDomain={compareCrossDomain}
                  />
                </div>
              )}

              {compareIds.length > 0 && (
                <div className="flex items-center border-b border-line px-4 py-2 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setCompareIds([])}
                    className="rounded-full border border-line bg-panel-raised px-3 py-1 text-xs font-semibold text-fg-muted transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    Clear selection ({compareIds.length})
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                  <thead className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                      <th className="w-12 px-3 py-3 sm:px-4" />
                      <th className="px-3 py-3 font-semibold">Lander</th>
                      <th className="px-3 py-3 font-semibold">Domain</th>
                      {thSort("views", "Views", "text-right")}
                      {thSort("clicks", "Clicks", "text-right")}
                      {thSort("ctr", "CR", "text-right")}
                      {thSort("bounceRate", "Bounce", "text-right")}
                      <th className="hidden px-3 py-3 text-right font-semibold lg:table-cell">
                        Returning
                      </th>
                      {thSort(
                        "avgTimeOnPageMs",
                        "Avg time",
                        "hidden text-right lg:table-cell",
                      )}
                      {thSort(
                        "avgMaxScrollPct",
                        "Avg scroll",
                        "hidden text-right lg:table-cell",
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.isLoading &&
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr
                          key={i}
                          className="animate-pulse border-b border-line"
                        >
                          <td className="px-3 py-4 sm:px-4">
                            <div className="h-4 w-4 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="h-3 w-36 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="h-5 w-24 rounded-full bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                          <td className="hidden px-3 py-4 lg:table-cell">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                          <td className="hidden px-3 py-4 lg:table-cell">
                            <div className="ml-auto h-3 w-12 rounded bg-panel-raised" />
                          </td>
                          <td className="hidden px-3 py-4 lg:table-cell">
                            <div className="ml-auto h-3 w-10 rounded bg-panel-raised" />
                          </td>
                        </tr>
                      ))}

                    {!analytics.isLoading && pageRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-5 py-16 text-center text-sm text-fg-subtle"
                        >
                          No visits recorded in this period.
                        </td>
                      </tr>
                    )}

                    {!analytics.isLoading &&
                      pageRows.map((row) => (
                        <tr
                          key={row.landingPageId}
                          className={`cursor-pointer border-b border-line transition hover:bg-hover ${
                            selected === row.landingPageId
                              ? "bg-main-color/10"
                              : ""
                          }`}
                          onClick={() =>
                            setSelected((s) =>
                              s === row.landingPageId
                                ? null
                                : row.landingPageId,
                            )
                          }
                        >
                          <td
                            className="px-3 py-2 sm:px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              size="small"
                              checked={compareIds.includes(row.landingPageId)}
                              onChange={() =>
                                toggleCompare(row.landingPageId)
                              }
                              inputProps={{
                                "aria-label": `Compare ${
                                  row.landingPageName ?? row.landingPageId
                                }`,
                              }}
                              sx={checkboxSx}
                            />
                          </td>
                          <td className="px-3 py-3.5">
                            {row.landingPageName ? (
                              <p className="truncate font-medium text-fg">
                                {row.landingPageName}
                              </p>
                            ) : (
                              <p
                                className="truncate text-fg-subtle"
                                title={row.landingPageId}
                              >
                                {row.landingPageId}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex max-w-[10rem] truncate rounded-full border border-line bg-panel-raised px-2.5 py-0.5 text-[11px] font-medium text-fg-muted">
                              {row.domainName ?? "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-right tabular-nums text-fg-muted">
                            {row.views}
                          </td>
                          <td className="px-3 py-3.5 text-right tabular-nums text-fg-muted">
                            {row.clicks}
                          </td>
                          <td className="px-3 py-3.5 text-right tabular-nums text-fg-muted">
                            {formatPct(row.ctr)}
                          </td>
                          <td className="px-3 py-3.5 text-right tabular-nums text-fg-muted">
                            {formatPct(row.bounceRate)}
                          </td>
                          <td className="hidden px-3 py-3.5 text-right tabular-nums text-fg-muted lg:table-cell">
                            {formatReturningPct(
                              row.returningViews,
                              row.identifiedViews,
                            )}
                          </td>
                          <td className="hidden px-3 py-3.5 text-right tabular-nums text-fg-muted lg:table-cell">
                            {formatDurationMs(row.avgTimeOnPageMs)}
                          </td>
                          <td className="hidden px-3 py-3.5 text-right tabular-nums text-fg-muted lg:table-cell">
                            {row.avgMaxScrollPct === null
                              ? "—"
                              : `${row.avgMaxScrollPct}%`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center border-t border-line px-5 py-4">
                  <div className="rounded-full border border-line-strong bg-panel-raised px-3 py-2">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, p) => setPage(p)}
                      color="primary"
                      sx={paginationSx}
                    />
                  </div>
                </div>
              )}

              {selected && range && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
                  onClick={() => setSelected(null)}
                >
                  <div
                    className="relative max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-line bg-panel p-5 text-fg shadow-2xl sm:p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-2 flex items-start justify-end">
                      <button
                        type="button"
                        aria-label="Close"
                        className="rounded-lg p-2 text-fg-muted transition hover:bg-hover hover:text-fg"
                        onClick={() => setSelected(null)}
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>
                    <LanderDetailPanel
                      landingPageId={selected}
                      from={range.from}
                      to={isLive ? undefined : range.to}
                      live={isLive}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
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