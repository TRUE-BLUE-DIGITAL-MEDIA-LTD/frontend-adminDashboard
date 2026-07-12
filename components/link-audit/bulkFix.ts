import { LinkAuditResult } from "../../models";

/** Domains eligible for bulk fix — only MISMATCH rows have anything to fix. */
export function selectableDomainIds(results: LinkAuditResult[]): string[] {
  return results
    .filter((r) => r.status === "MISMATCH")
    .map((r) => r.domainId);
}

export interface BulkFixOutcome {
  domainName: string;
  fixedPages: number;
  failed: boolean;
}

/** One-line summary shown after a bulk run, e.g.
 *  "Fixed 11 domains (14 pages). 1 domain failed: example.com" */
export function buildBulkSummary(outcomes: BulkFixOutcome[]): string {
  const ok = outcomes.filter((o) => !o.failed);
  const failed = outcomes.filter((o) => o.failed);
  const pages = outcomes.reduce((n, o) => n + o.fixedPages, 0);
  let summary = `Fixed ${ok.length} domain${ok.length === 1 ? "" : "s"} (${pages} page${
    pages === 1 ? "" : "s"
  }).`;
  if (failed.length > 0) {
    summary += ` ${failed.length} domain${failed.length === 1 ? "" : "s"} failed: ${failed
      .map((o) => o.domainName)
      .join(", ")}`;
  }
  return summary;
}
