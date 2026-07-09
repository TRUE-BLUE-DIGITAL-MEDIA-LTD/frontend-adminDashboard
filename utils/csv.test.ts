import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins headers and rows with CRLF", () => {
    const csv = toCsv(["a", "b"], [["1", "2"], ["3", "4"]]);
    expect(csv).toBe("a,b\r\n1,2\r\n3,4");
  });

  it("quotes fields containing commas, quotes, and newlines", () => {
    const csv = toCsv(["v"], [['say "hi", ok']], );
    expect(csv).toBe('v\r\n"say ""hi"", ok"');
  });

  it("renders null and undefined as empty strings", () => {
    const csv = toCsv(["a", "b"], [[null, undefined]]);
    expect(csv).toBe("a,b\r\n,");
  });

  it("stringifies numbers", () => {
    const csv = toCsv(["n"], [[42]]);
    expect(csv).toBe("n\r\n42");
  });

  it("neutralizes spreadsheet formula characters with a leading quote", () => {
    const csv = toCsv(["v"], [["=SUM(A1)"]]);
    expect(csv).toBe("v\r\n'=SUM(A1)");
  });

  it("still RFC-4180 quotes a neutralized field that needs it", () => {
    const csv = toCsv(["v"], [["=SUM(A1),B1"]]);
    expect(csv).toBe(`v\r\n"'=SUM(A1),B1"`);
  });
});
