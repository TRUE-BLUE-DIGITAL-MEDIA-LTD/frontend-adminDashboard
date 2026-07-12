import { describe, expect, it } from "vitest";
import { buildBulkSummary, selectableDomainIds } from "./bulkFix";
import { LinkAuditResult } from "../../models";

function row(partial: Partial<LinkAuditResult>): LinkAuditResult {
  return {
    id: "r1",
    domainId: "d1",
    domainName: "a.com",
    partnerId: null,
    partnerName: null,
    status: "OK",
    mismatchCount: 0,
    landingPageCount: 1,
    findings: [],
    scannedAt: "2026-07-12T00:00:00.000Z",
    ...partial,
  };
}

describe("selectableDomainIds", () => {
  it("returns only MISMATCH rows, in table order", () => {
    const results = [
      row({ domainId: "d1", status: "MISMATCH" }),
      row({ domainId: "d2", status: "OK" }),
      row({ domainId: "d3", status: "MISMATCH" }),
      row({ domainId: "d4", status: "ERROR" }),
      row({ domainId: "d5", status: "UNASSIGNED" }),
    ];
    expect(selectableDomainIds(results)).toEqual(["d1", "d3"]);
  });

  it("returns empty for no results", () => {
    expect(selectableDomainIds([])).toEqual([]);
  });
});

describe("buildBulkSummary", () => {
  it("summarizes an all-success run with plural forms", () => {
    expect(
      buildBulkSummary([
        { domainName: "a.com", fixedPages: 2, failed: false },
        { domainName: "b.com", fixedPages: 1, failed: false },
      ]),
    ).toBe("Fixed 2 domains (3 pages).");
  });

  it("uses singular forms for one domain and one page", () => {
    expect(
      buildBulkSummary([{ domainName: "a.com", fixedPages: 1, failed: false }]),
    ).toBe("Fixed 1 domain (1 page).");
  });

  it("names failed domains and still counts their fixed pages", () => {
    expect(
      buildBulkSummary([
        { domainName: "a.com", fixedPages: 2, failed: false },
        { domainName: "bad.com", fixedPages: 1, failed: true },
        { domainName: "worse.com", fixedPages: 0, failed: true },
      ]),
    ).toBe(
      "Fixed 1 domain (3 pages). 2 domains failed: bad.com, worse.com",
    );
  });
});
