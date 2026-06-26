import { Alert, Button, Chip, CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LinkAuditStatus } from "../../models";
import {
  FixLinkService,
  ScanDomainAuditService,
} from "../../services/admin/link-audit";

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
      <div className="flex items-center gap-2 p-4">
        <CircularProgress size={18} /> Scanning links…
      </div>
    );
  }

  if (audit.isError) {
    return (
      <Alert severity="error" className="m-2">
        Could not scan this domain&apos;s links.
      </Alert>
    );
  }

  const data = audit.data!;

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Link health</span>
          <Chip size="small" label={data.status} color={statusColor[data.status]} />
          <span className="text-sm text-gray-500">
            {data.mismatchCount}/{data.landingPageCount} landing pages mismatched
          </span>
        </div>
        {data.mismatchCount > 0 && (
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={fix.isPending}
            onClick={fixAll}
          >
            {fix.isPending ? "Fixing…" : "Fix all on this domain"}
          </Button>
        )}
      </div>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {data.status === "UNASSIGNED" && (
        <Alert severity="info">
          No partner is assigned to this domain, so links can&apos;t be checked.
        </Alert>
      )}

      {data.mismatchCount === 0 && data.status !== "UNASSIGNED" && (
        <Alert severity="success">All landing-page links match the partner.</Alert>
      )}

      {data.findings.map((f) => (
        <div key={f.landingPageId} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {f.landingPageName ?? f.landingPageId}
              <span className="ml-2 text-xs text-gray-400">{f.percent}%</span>
            </div>
            <Button
              size="small"
              variant="outlined"
              disabled={fix.isPending}
              onClick={() => runFix(f.landingPageId)}
            >
              Fix
            </Button>
          </div>

          {f.error && (
            <Alert severity="warning" className="mt-2">
              {f.error}
            </Alert>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {f.links
              .filter((l) => !l.matched)
              .map((l, i) => (
                <div key={i} className="rounded bg-gray-50 p-2 text-xs">
                  <div className="font-semibold">{l.location}</div>
                  <div className="break-all text-red-600">
                    actual: {l.actual || "(empty)"}
                  </div>
                  <div className="break-all text-green-700">
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
