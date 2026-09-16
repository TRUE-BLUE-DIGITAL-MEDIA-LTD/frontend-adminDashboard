import { describe, expect, it } from "vitest";
import { nextDomainListSort, parseDomainListSort } from "./domainListSort";

describe("nextDomainListSort", () => {
  it("cycles default → slowest first → fastest first → default", () => {
    expect(nextDomainListSort(undefined)).toBe("load-desc");
    expect(nextDomainListSort("load-desc")).toBe("load-asc");
    expect(nextDomainListSort("load-asc")).toBeUndefined();
    expect(nextDomainListSort("name")).toBe("load-desc");
  });
});

describe("parseDomainListSort", () => {
  it("accepts only known values", () => {
    expect(parseDomainListSort("load-desc")).toBe("load-desc");
    expect(parseDomainListSort("name")).toBe("name");
    expect(parseDomainListSort("bogus")).toBeUndefined();
    expect(parseDomainListSort(undefined)).toBeUndefined();
  });
});
