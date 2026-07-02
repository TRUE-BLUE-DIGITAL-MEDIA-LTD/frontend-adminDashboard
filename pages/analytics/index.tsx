import {
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
import moment from "moment";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { useMemo, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import {
  formatDurationMs,
  formatPct,
  SortKey,
  sortRows,
} from "../../components/analytics/format";
import DashboardLayout from "../../layouts/dashboardLayout";
import { User } from "../../models";
import { ListLanderAnalyticsService } from "../../services/admin/analytics";
import { GetUser } from "../../services/admin/user";

const RANGE_OPTIONS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const PAGE_SIZE = 50;

function Index({ user }: { user: User }) {
  const [days, setDays] = useState<number>(30);
  const [search, setSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<string | null>(null);

  const from = useMemo(
    () => moment().subtract(days, "days").toISOString(),
    [days],
  );

  const analytics = useQuery({
    queryKey: ["lander-analytics", days, search],
    queryFn: () =>
      ListLanderAnalyticsService({ from, search: search || undefined }),
  });

  const rows = useMemo(
    () => sortRows(analytics.data?.rows ?? [], sortKey, sortDir),
    [analytics.data, sortKey, sortDir],
  );
  const totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setPage(1);
            }}
          >
            {RANGE_OPTIONS.map((o) => (
              <MenuItem key={o.days} value={o.days}>
                {o.label}
              </MenuItem>
            ))}
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

        {analytics.isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Lander</TableCell>
                  <TableCell className="font-semibold">Domain</TableCell>
                  {header("views", "Views")}
                  {header("clicks", "Clicks")}
                  {header("bounceRate", "Bounce")}
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
                    <TableCell>{row.landingPageName ?? row.landingPageId}</TableCell>
                    <TableCell>{row.domainName ?? "—"}</TableCell>
                    <TableCell>{row.views}</TableCell>
                    <TableCell>{row.clicks}</TableCell>
                    <TableCell>{formatPct(row.bounceRate)}</TableCell>
                    <TableCell>{formatDurationMs(row.avgTimeOnPageMs)}</TableCell>
                    <TableCell>
                      {row.avgMaxScrollPct === null ? "—" : `${row.avgMaxScrollPct}%`}
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
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
            {/* Task 14 wires the detail panel here:
            {selected && (
              <LanderDetailPanel landingPageId={selected} from={from} />
            )} */}
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
