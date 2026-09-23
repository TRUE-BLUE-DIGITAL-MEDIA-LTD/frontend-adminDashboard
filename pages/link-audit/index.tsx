import {
  Checkbox,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { FiExternalLink, FiRefreshCw, FiSearch, FiTool } from "react-icons/fi";
import moment from "moment";
import DashboardLayout from "../../layouts/dashboardLayout";
import { LinkAuditStatus, User } from "../../models";
import {
  FixDomainAuditService,
  ListLinkAuditService,
  RescanLinkAuditService,
} from "../../services/admin/link-audit";
import {
  BulkFixOutcome,
  buildBulkSummary,
  selectableDomainIds,
} from "../../components/link-audit/bulkFix";
import { GetUser } from "../../services/admin/user";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All statuses", value: "" },
  { label: "Mismatch", value: "MISMATCH" },
  { label: "OK", value: "OK" },
  { label: "No smartlink", value: "NO_SMARTLINK" },
  { label: "Unassigned", value: "UNASSIGNED" },
  { label: "Error", value: "ERROR" },
];

const statusPillClass: Record<LinkAuditStatus, string> = {
  OK: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  MISMATCH: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  ERROR: "border-rose-500/40 bg-rose-500/15 text-rose-200",
  NO_SMARTLINK: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  UNASSIGNED: "border-white/10 bg-white/5 text-zinc-400",
};

const statusDotClass: Record<LinkAuditStatus, string> = {
  OK: "bg-emerald-400",
  MISMATCH: "bg-rose-400",
  ERROR: "bg-rose-300",
  NO_SMARTLINK: "bg-amber-400",
  UNASSIGNED: "bg-zinc-500",
};

const paginationSx = {
  "& .MuiPaginationItem-root": { color: "#ffffff" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  "& .MuiPaginationItem-icon": { color: "#ffffff" },
};

const checkboxSx = {
  color: "rgba(255,255,255,0.35)",
  "&.Mui-checked": { color: "#00ABE4" },
  "&.MuiCheckbox-indeterminate": { color: "#00ABE4" },
  "&.Mui-disabled": { color: "rgba(255,255,255,0.15)" },
};

const selectSx = {
  color: "#e4e4e7",
  fontSize: "0.875rem",
  borderRadius: "9999px",
  backgroundColor: "rgba(0,0,0,0.4)",
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: "9999px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.2)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#00ABE4",
  },
  ".MuiSvgIcon-root": { color: "#a1a1aa" },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#18181b",
      color: "#e4e4e7",
      border: "1px solid rgba(255,255,255,0.1)",
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
        "&.Mui-selected": {
          bgcolor: "rgba(0,171,228,0.15)",
          "&:hover": { bgcolor: "rgba(0,171,228,0.25)" },
        },
      },
    },
  },
};

function Index({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("MISMATCH");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const canRescan = user.role === "admin" || user.role === "manager";

  const audit = useQuery({
    queryKey: ["link-audit", status, search, page],
    queryFn: () =>
      ListLinkAuditService({
        status: status || undefined,
        search: search || undefined,
        page,
      }),
  });

  const rescan = useMutation({
    mutationFn: RescanLinkAuditService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-audit"] });
    },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);

  const results = audit.data?.results ?? [];
  const selectableIds = selectableDomainIds(results);
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.has(id));
  const someSelected = selectableIds.some((id) => selected.has(id));
  const bulkRunning = bulkProgress !== null;

  const clearSelection = () => setSelected(new Set());

  const toggleRow = (domainId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(selectableIds));
  };

  const runBulkFix = async () => {
    const ids = selectableIds.filter((id) => selected.has(id));
    setBulkSummary(null);
    setBulkProgress({ done: 0, total: ids.length });
    const outcomes: BulkFixOutcome[] = [];
    for (let i = 0; i < ids.length; i++) {
      const name =
        results.find((r) => r.domainId === ids[i])?.domainName ?? ids[i];
      try {
        const res = await FixDomainAuditService(ids[i]);
        outcomes.push({
          domainName: name,
          fixedPages: res.fixed,
          failed: res.failed > 0,
        });
      } catch {
        outcomes.push({ domainName: name, fixedPages: 0, failed: true });
      }
      setBulkProgress({ done: i + 1, total: ids.length });
    }
    setBulkProgress(null);
    setSelected(new Set());
    setBulkSummary(buildBulkSummary(outcomes));
    queryClient.invalidateQueries({ queryKey: ["link-audit"] });
  };

  return (
    <DashboardLayout user={user}>
      <main className="flex min-h-screen w-full flex-col items-center bg-black p-3 font-Poppins text-zinc-100 sm:p-5">
        <section className="w-full max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100">
          {/* Toolbar */}
          <header className="flex flex-col gap-4 border-b border-white/5 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-main-color">
                Control Center
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Link Audit
              </h1>
              <p className="text-sm text-zinc-500">
                Scan domain smartlinks, catch mismatches, and fix in bulk.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {canRescan && selected.size > 0 && (
                <button
                  type="button"
                  disabled={bulkRunning}
                  onClick={runBulkFix}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiTool className="text-base" />
                  {bulkProgress
                    ? `Fixing ${bulkProgress.done}/${bulkProgress.total}…`
                    : `Fix selected (${selected.size})`}
                </button>
              )}
              {canRescan && (
                <button
                  type="button"
                  disabled={rescan.isPending}
                  onClick={() => rescan.mutate()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`text-base ${rescan.isPending ? "animate-spin" : ""}`}
                  />
                  {rescan.isPending
                    ? "Scanning…"
                    : user.role === "admin"
                      ? "Re-scan all domains"
                      : "Re-scan my domains"}
                </button>
              )}
            </div>
          </header>

          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
            <Select
              size="small"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                clearSelection();
              }}
              className="min-w-[160px]"
              sx={selectSx}
              MenuProps={selectMenuProps}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>

            <SearchField
              aria-label="Search domain"
              onSubmit={(value) => {
                setSearch(value);
                setPage(1);
                clearSelection();
              }}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-zinc-200 sm:max-w-xs"
            >
              <FiSearch className="shrink-0 text-zinc-500" size={16} />
              <Input
                placeholder="Search domain..."
                className="w-full bg-transparent py-0.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              />
            </SearchField>
          </div>

          {bulkSummary && (
            <div className="mx-4 mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 sm:mx-5">
              {bulkSummary}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed text-left text-sm">
              <thead className="sticky top-0 z-20 border-b border-white/5 bg-zinc-900/95 backdrop-blur">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="w-12 px-3 py-3 sm:px-5">
                    <Checkbox
                      size="small"
                      disabled={selectableIds.length === 0 || bulkRunning}
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={toggleSelectAll}
                      inputProps={{
                        "aria-label": "Select all mismatched domains",
                      }}
                      sx={checkboxSx}
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">Domain</th>
                  <th className="px-3 py-3 font-semibold">Partner</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 text-right font-semibold">
                    Mismatches
                  </th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">
                    Last scanned
                  </th>
                  <th className="w-20 px-3 py-3 text-right font-semibold sm:px-5">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {audit.isLoading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr
                      key={i}
                      className="animate-pulse border-b border-white/5"
                    >
                      <td className="px-3 py-4 sm:px-5">
                        <div className="h-4 w-4 rounded bg-zinc-700" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-2">
                          <div className="h-3 w-36 rounded bg-zinc-700" />
                          <div className="h-2.5 w-24 rounded bg-zinc-800" />
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-5 w-20 rounded-full bg-zinc-700" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-5 w-24 rounded-full bg-zinc-700" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="ml-auto h-3 w-8 rounded bg-zinc-700" />
                      </td>
                      <td className="hidden px-3 py-4 md:table-cell">
                        <div className="h-3 w-28 rounded bg-zinc-700" />
                      </td>
                      <td className="px-3 py-4 sm:px-5">
                        <div className="ml-auto h-8 w-8 rounded-lg bg-zinc-700" />
                      </td>
                    </tr>
                  ))}

                {!audit.isLoading && (audit.data?.results.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-zinc-500"
                    >
                      No domains match this filter.
                    </td>
                  </tr>
                )}

                {results.map((row) => (
                  <tr
                    key={row.domainId}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-3 py-3 sm:px-5">
                      <Checkbox
                        size="small"
                        disabled={row.status !== "MISMATCH" || bulkRunning}
                        checked={selected.has(row.domainId)}
                        onChange={() => toggleRow(row.domainId)}
                        inputProps={{
                          "aria-label": `Select ${row.domainName}`,
                        }}
                        sx={checkboxSx}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="truncate font-medium text-white">
                        {row.domainName}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex max-w-[10rem] truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                        {row.partnerName ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${statusPillClass[row.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass[row.status]}`}
                        />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-zinc-300">
                      {row.mismatchCount}
                    </td>
                    <td className="hidden px-3 py-3.5 text-xs text-zinc-500 md:table-cell">
                      {row.scannedAt
                        ? moment(row.scannedAt).format("YYYY-MM-DD HH:mm")
                        : "—"}
                    </td>
                    <td className="px-3 py-3.5 text-right sm:px-5">
                      <Link
                        target="_blank"
                        href={`/domain?domainId=${row.domainId}&domainName=${encodeURIComponent(
                          row.domainName,
                        )}`}
                        className="inline-flex rounded-lg p-2 text-main-color transition hover:bg-main-color/10"
                        title="Open domain"
                      >
                        <FiExternalLink className="text-base" />
                        <span className="sr-only">Open</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(audit.data?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center border-t border-white/5 px-5 py-4">
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
                <Pagination
                  count={audit.data?.totalPages ?? 1}
                  page={page}
                  onChange={(_, p) => {
                    setPage(p);
                    clearSelection();
                  }}
                  color="primary"
                  sx={paginationSx}
                />
              </div>
            </div>
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
