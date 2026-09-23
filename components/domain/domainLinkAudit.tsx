import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiTool } from "react-icons/fi";
import { LinkAuditStatus } from "../../models";
import {
  FixLinkService,
  ScanDomainAuditService,
} from "../../services/admin/link-audit";

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

function formatError(err: any): string {
  const m = err?.message ?? err;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return "Fix failed";
}

export default function DomainLinkAudit({ domainId }: { domainId: string }) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audit = useQuery({
    queryKey: ["domain-audit", domainId],
    queryFn: () => ScanDomainAuditService(domainId),
    enabled: !!domainId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["domain-audit", domainId] });

  const fix = useMutation({
    mutationFn: (landingPageId: string) => FixLinkService(landingPageId),
    onError: (err: any) => {
      setErrorMsg(formatError(err));
    },
  });

  const runFix = async (landingPageId: string) => {
    setErrorMsg(null);
    try {
      await fix.mutateAsync(landingPageId);
    } finally {
      invalidate();
    }
  };

  const fixAll = async () => {
    setErrorMsg(null);
    const targets = audit.data?.findings.map((f) => f.landingPageId) ?? [];
    for (const id of targets) {
      try {
        await fix.mutateAsync(id);
      } catch {
        break; // onError already surfaced the message
      }
    }
    // single refetch after the whole batch, not once per page
    invalidate();
  };

  if (audit.isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-zinc-400">
        <CircularProgress size={18} sx={{ color: "#00ABE4" }} /> Scanning
        links…
      </div>
    );
  }

  if (audit.isError) {
    return (
      <div className="m-2 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
        <FiAlertTriangle className="mt-0.5 shrink-0" />
        Could not scan this domain&apos;s links.
      </div>
    );
  }

  const data = audit.data!;

  return (
    <div className="flex flex-col gap-3 p-2 text-zinc-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white">Link health</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${statusPillClass[data.status]}`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass[data.status]}`}
            />
            {data.status}
          </span>
          <span className="text-sm text-zinc-500">
            {data.mismatchCount}/{data.landingPageCount} landing pages
            mismatched
          </span>
        </div>
        {data.mismatchCount > 0 && (
          <button
            type="button"
            disabled={fix.isPending}
            onClick={fixAll}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-3.5 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiTool className="text-sm" />
            {fix.isPending ? "Fixing…" : "Fix all on this domain"}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {data.status === "UNASSIGNED" && (
        <div className="flex items-start gap-2 rounded-xl border border-main-color/30 bg-main-color/10 px-3 py-2 text-sm text-[#62C7D8]">
          <FiInfo className="mt-0.5 shrink-0" />
          No partner is assigned to this domain, so links can&apos;t be
          checked.
        </div>
      )}

      {data.mismatchCount === 0 && data.status !== "UNASSIGNED" && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          <FiCheckCircle className="mt-0.5 shrink-0" />
          All landing-page links match the partner.
        </div>
      )}

      {data.findings.map((f) => (
        <div
          key={f.landingPageId}
          className="rounded-xl border border-white/10 bg-black/30 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 font-medium text-white">
              <span className="truncate">
                {f.landingPageName ?? f.landingPageId}
              </span>
              <span className="ml-2 text-xs text-zinc-500">{f.percent}%</span>
            </div>
            <button
              type="button"
              disabled={fix.isPending}
              onClick={() => runFix(f.landingPageId)}
              className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-main-color/40 hover:bg-main-color/10 hover:text-main-color disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fix
            </button>
          </div>

          {f.error && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200">
              <FiAlertTriangle className="mt-0.5 shrink-0" />
              {f.error}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {f.links
              .filter((l) => !l.matched)
              .map((l, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-zinc-900/80 p-2 text-xs"
                >
                  <div className="font-semibold text-zinc-300">{l.location}</div>
                  <div className="break-all text-rose-300">
                    actual: {l.actual || "(empty)"}
                  </div>
                  <div className="break-all text-emerald-300">
                    expected: {l.expected}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
