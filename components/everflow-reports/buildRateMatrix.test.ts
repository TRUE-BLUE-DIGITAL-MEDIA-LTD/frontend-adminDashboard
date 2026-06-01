import { describe, it, expect } from "vitest";
import type { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { buildRateMatrix } from "./buildRateMatrix";

function makeRate(partial: Partial<AdjustLeadRate>): AdjustLeadRate {
  return {
    id: partial.id ?? "id",
    createAt: "2026-01-01T00:00:00.000Z",
    updateAt: "2026-01-01T00:00:00.000Z",
    rate: partial.rate ?? 1,
    targetCurrency: partial.targetCurrency ?? "USD",
    convertedCurrency: partial.convertedCurrency ?? "USD",
    campaignId: partial.campaignId ?? "98",
    country: partial.country ?? "France",
    type: partial.type ?? "fixed",
    startDate: partial.startDate,
    endDate: partial.endDate,
  };
}

describe("buildRateMatrix", () => {
  it("collapses the EUR/USD targetCurrency pair to the USD-target row", () => {
    const eur = makeRate({ id: "eur", targetCurrency: "EUR", rate: 0.75 });
    const usd = makeRate({ id: "usd", targetCurrency: "USD", rate: 0.75 });
    const m = buildRateMatrix([eur, usd]);
    expect(m.cell("France", "98")?.id).toBe("usd");
  });

  it("falls back to the remaining row when there is no USD-target", () => {
    const eur = makeRate({ id: "eur-only", targetCurrency: "EUR", rate: 0.75 });
    const m = buildRateMatrix([eur]);
    expect(m.cell("France", "98")?.id).toBe("eur-only");
  });

  it("returns unique countries sorted alphabetically", () => {
    const m = buildRateMatrix([
      makeRate({ country: "Norway" }),
      makeRate({ country: "Australia" }),
      makeRate({ country: "Norway", campaignId: "99" }),
    ]);
    expect(m.countries).toEqual(["Australia", "Norway"]);
  });

  it("returns unique campaignIds", () => {
    const m = buildRateMatrix([
      makeRate({ campaignId: "98" }),
      makeRate({ campaignId: "99" }),
      makeRate({ campaignId: "98", country: "Norway" }),
    ]);
    expect([...m.campaignIds].sort()).toEqual(["98", "99"]);
  });

  it("returns undefined for a missing (country, campaignId) cell", () => {
    const m = buildRateMatrix([makeRate({ country: "France", campaignId: "98" })]);
    expect(m.cell("Norway", "98")).toBeUndefined();
    expect(m.cell("France", "99")).toBeUndefined();
  });

  it("includes both fixed and exchange types", () => {
    const m = buildRateMatrix([
      makeRate({ id: "fx", type: "fixed", country: "France", campaignId: "98" }),
      makeRate({ id: "ex", type: "exchange", country: "Italy", campaignId: "98" }),
    ]);
    expect(m.cell("France", "98")?.id).toBe("fx");
    expect(m.cell("Italy", "98")?.id).toBe("ex");
  });

  it("keeps a different slot unaffected by another slot's rates", () => {
    const m = buildRateMatrix([
      makeRate({ id: "fr", country: "France", campaignId: "98", rate: 0.75 }),
      makeRate({ id: "no", country: "Norway", campaignId: "98", rate: 1.2 }),
    ]);
    expect(m.cell("France", "98")?.rate).toBe(0.75);
    expect(m.cell("Norway", "98")?.rate).toBe(1.2);
  });

  it("a scheduled temp wins over an always-active rate via startDate recency", () => {
    const always = makeRate({ id: "always", targetCurrency: "USD" });
    const temp = makeRate({
      id: "temp",
      targetCurrency: "USD",
      startDate: "2026-05-30T00:00:00.000Z",
      endDate: "2026-06-07T00:00:00.000Z",
    });
    const m = buildRateMatrix([always, temp]);
    expect(m.cell("France", "98")?.id).toBe("temp");
    expect(m.countries).toEqual(["France"]);
    expect([...m.campaignIds]).toEqual(["98"]);
  });

  it("picks the non-ended temp with the most recent startDate", () => {
    // ids chosen so the OLDER-startDate row sorts first under the current
    // id-based tiebreak ("r1" < "r2"), proving the new startDate rule overrides it.
    const older = makeRate({
      id: "r1",
      targetCurrency: "EUR",
      rate: 1.0,
      startDate: "2026-05-08T15:42:25.000Z",
      endDate: "2026-10-08T08:42:25.000Z",
    });
    const newer = makeRate({
      id: "r2",
      targetCurrency: "EUR",
      rate: 0.75,
      startDate: "2026-05-31T00:00:00.000Z",
      endDate: "2026-09-30T17:00:00.000Z",
    });
    const m = buildRateMatrix([older, newer]);
    expect(m.cell("France", "98")?.id).toBe("r2");
    expect(m.cell("France", "98")?.rate).toBe(0.75);
  });

  it("collapses a same-startDate EUR/USD pair to the USD-target row", () => {
    const eur = makeRate({
      id: "eur",
      targetCurrency: "EUR",
      startDate: "2026-05-31T00:00:00.000Z",
      endDate: "2026-06-07T00:00:00.000Z",
    });
    const usd = makeRate({
      id: "usd",
      targetCurrency: "USD",
      startDate: "2026-05-31T00:00:00.000Z",
      endDate: "2026-06-07T00:00:00.000Z",
    });
    const m = buildRateMatrix([eur, usd]);
    expect(m.cell("France", "98")?.id).toBe("usd");
  });
});
