import {
  Button,
  Chip,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import moment from "moment";
import DashboardLayout from "../../layouts/dashboardLayout";
import { LinkAuditStatus, User } from "../../models";
import {
  ListLinkAuditService,
  RescanLinkAuditService,
} from "../../services/admin/link-audit";
import { GetUser } from "../../services/admin/user";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All statuses", value: "" },
  { label: "Mismatch", value: "MISMATCH" },
  { label: "OK", value: "OK" },
  { label: "No smartlink", value: "NO_SMARTLINK" },
  { label: "Unassigned", value: "UNASSIGNED" },
  { label: "Error", value: "ERROR" },
];

const statusColor: Record<
  LinkAuditStatus,
  "success" | "error" | "warning" | "default"
> = {
  OK: "success",
  MISMATCH: "error",
  ERROR: "error",
  NO_SMARTLINK: "warning",
  UNASSIGNED: "default",
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

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Link Audit</h1>
          <div className="flex flex-wrap items-center gap-3">
            {canRescan && (
              <Button
                variant="contained"
                disabled={rescan.isPending}
                onClick={() => rescan.mutate()}
              >
                {rescan.isPending
                  ? "Scanning…"
                  : user.role === "admin"
                    ? "Re-scan all domains"
                    : "Re-scan my domains"}
              </Button>
            )}
            <Select
              size="small"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="min-w-[160px] bg-white"
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
              }}
              className="flex items-center gap-1 rounded border bg-white px-2"
            >
              <IoSearchCircleSharp size={22} />
              <Input
                placeholder="Search domain..."
                className="py-1 outline-none"
              />
            </SearchField>
          </div>
        </div>

        <div className="rounded border bg-white">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Domain</TableCell>
                <TableCell>Partner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Mismatches</TableCell>
                <TableCell>Last scanned</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {audit.isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}

              {!audit.isLoading && (audit.data?.results.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No domains match this filter.
                  </TableCell>
                </TableRow>
              )}

              {audit.data?.results.map((row) => (
                <TableRow key={row.domainId} hover>
                  <TableCell className="font-medium">
                    {row.domainName}
                  </TableCell>
                  <TableCell>{row.partnerName ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      color={statusColor[row.status]}
                    />
                  </TableCell>
                  <TableCell align="right">{row.mismatchCount}</TableCell>
                  <TableCell>
                    {row.scannedAt
                      ? moment(row.scannedAt).format("YYYY-MM-DD HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Link
                      target="_blank"
                      href={`/domain?domainId=${row.domainId}&domainName=${encodeURIComponent(
                        row.domainName,
                      )}`}
                      className="text-blue-600 underline"
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {(audit.data?.totalPages ?? 1) > 1 && (
          <div className="flex justify-center">
            <Pagination
              count={audit.data?.totalPages ?? 1}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          </div>
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
