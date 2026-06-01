import { describe, it, expect } from "vitest";
import type { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { computeDisplayRates } from "./computeDisplayRates";

const NOW = new Date("2026-06-01T00:00:00.000Z");

function makeRate(partial: Partial<AdjustLeadRate>): AdjustLeadRate {
  return {
    id: partial.id ?? "id",
    createAt: "2026-01-01T00:00:00.000Z",
    updateAt: "2026-01-01T00:00:00.000Z",
    rate: partial.rate ?? 1,
    targetCurrency: partial.targetCurrency ?? "USD",
    convertedCurrency: partial.convertedCurrency ?? "THB",
    campaignId: partial.campaignId ?? "123",
    country: partial.country ?? "Thailand",
    type: partial.type ?? "exchange",
    startDate: partial.startDate,
    endDate: partial.endDate,
  };
}

// Same slot (country+campaign+targetCurrency+convertedCurrency) as the always-active below.
const alwaysActive = makeRate({ id: "always", rate: 32 });
const liveTemp = makeRate({
  id: "live",
  rate: 33.5,
  startDate: "2026-05-30T00:00:00.000Z",
  endDate: "2026-06-07T00:00:00.000Z",
});
const upcomingTemp = makeRate({
  id: "upcoming",
  rate: 34,
  startDate: "2026-06-15T00:00:00.000Z",
  endDate: "2026-06-20T00:00:00.000Z",
});
const endedTemp = makeRate({
  id: "ended",
  rate: 30,
  startDate: "2026-05-01T00:00:00.000Z",
  endDate: "2026-05-20T00:00:00.000Z",
});
// Different currency pair -> different slot, must NOT hide alwaysActive.
const liveTempOtherSlot = makeRate({
  id: "live-eur",
  rate: 0.95,
  convertedCurrency: "EUR",
  startDate: "2026-05-30T00:00:00.000Z",
  endDate: "2026-06-07T00:00:00.000Z",
});

const ids = (rates: AdjustLeadRate[]) => rates.map((r) => r.id).sort();

describe("computeDisplayRates", () => {
  it("returns [] when rates is undefined", () => {
    expect(
      computeDisplayRates({
        rates: undefined,
        canSeeHistory: false,
        viewMode: "active",
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("always-active only: shown for partner and admin", () => {
    const rates = [alwaysActive];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always"]);
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always"]);
  });

  it("live temp hides its matching always-active for partner; admin sees both", () => {
    const rates = [alwaysActive, liveTemp];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["live"]);
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always", "live"]);
  });

  it("admin/manager active shows all always-active plus all non-ended temps (no replacement hiding)", () => {
    const rates = [alwaysActive, liveTemp, upcomingTemp];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always", "live", "upcoming"]);
  });

  it("upcoming temp: admin active shows temp + always-active; partner shows only always-active", () => {
    const rates = [alwaysActive, upcomingTemp];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always", "upcoming"]);
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always"]);
  });

  it("ended temp: in admin history only; never in active; never for partner", () => {
    const rates = [alwaysActive, endedTemp];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "history",
          now: NOW,
        }),
      ),
    ).toEqual(["ended"]);
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: true,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always"]);
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always"]);
  });

  it("live temp with no matching always-active shows as the effective rate", () => {
    const rates = [liveTemp];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["live"]);
  });

  it("live temp on a different slot does NOT hide the always-active rate", () => {
    const rates = [alwaysActive, liveTempOtherSlot];
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["always", "live-eur"]);
  });

  it("temp with only endDate (no startDate) is treated as live and hides always-active", () => {
    const openStart = makeRate({
      id: "open-start",
      endDate: "2026-06-07T00:00:00.000Z",
    });
    expect(
      ids(
        computeDisplayRates({
          rates: [alwaysActive, openStart],
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["open-start"]);
  });

  it("temp with only startDate in the past (no endDate) is treated as live", () => {
    const openEnd = makeRate({
      id: "open-end",
      startDate: "2026-05-01T00:00:00.000Z",
    });
    expect(
      ids(
        computeDisplayRates({
          rates: [openEnd],
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["open-end"]);
  });

  it("multiple overlapping live temps on one slot all show; always-active is hidden", () => {
    const live2 = makeRate({
      id: "live2",
      rate: 33.9,
      startDate: "2026-05-31T00:00:00.000Z",
      endDate: "2026-06-10T00:00:00.000Z",
    });
    expect(
      ids(
        computeDisplayRates({
          rates: [alwaysActive, liveTemp, live2],
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["live", "live2"]);
  });

  it("multiple always-active rows on one slot are all hidden when a live temp exists", () => {
    const always2 = makeRate({ id: "always2", rate: 31.5 });
    expect(
      ids(
        computeDisplayRates({
          rates: [alwaysActive, always2, liveTemp],
          canSeeHistory: false,
          viewMode: "active",
          now: NOW,
        }),
      ),
    ).toEqual(["live"]);
  });

  it("returns [] for an empty rates array", () => {
    expect(
      computeDisplayRates({
        rates: [],
        canSeeHistory: true,
        viewMode: "active",
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("partner with viewMode 'history' falls through to active effective view (no ended rates leak)", () => {
    const rates = [alwaysActive, endedTemp, liveTemp];
    // canSeeHistory=false: history branch is guarded, so this uses active logic.
    // liveTemp covers the slot, so only the live temp shows; endedTemp never appears.
    expect(
      ids(
        computeDisplayRates({
          rates,
          canSeeHistory: false,
          viewMode: "history",
          now: NOW,
        }),
      ),
    ).toEqual(["live"]);
  });
});
