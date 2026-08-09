import { describe, it, expect } from "vitest";
import {
  utcToWallDate,
  wallDateToUtcIso,
  initDateField,
  markDateField,
  outgoingIso,
  retimeDateField,
} from "./EditAdjustLeadRateDialog";

// The browser zone is process-level, so Case A has to run under a DST browser.
const withTimeZone = <T>(tz: string, fn: () => T): T => {
  const original = process.env.TZ;
  process.env.TZ = tz;
  try {
    return fn();
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
};

// What the save path did before untouched fields were tracked: derive the
// outgoing ISO from the Calendar's shell Date every time.
const legacyRoundTrip = (iso: string, tz: string) =>
  wallDateToUtcIso(utcToWallDate(iso, tz), tz);

describe("wall-clock round trip", () => {
  it.each([
    ["Asia/Bangkok", "2026-06-15T10:00:00.000Z"],
    ["Asia/Kathmandu", "2026-06-15T10:00:00.000Z"],
    ["UTC", "2026-06-15T10:00:00.000Z"],
    ["Europe/Rome", "2026-06-15T10:00:00.000Z"],
  ])("is exact for %s outside DST transitions", (tz, iso) => {
    expect(legacyRoundTrip(iso, tz)).toBe(iso);
  });

  it("displays the selected zone's wall clock, not the browser's", () => {
    // 10:00Z is 17:00 in Bangkok and 15:45 in Kathmandu (+05:45).
    expect(
      utcToWallDate("2026-06-15T10:00:00.000Z", "Asia/Bangkok").getHours(),
    ).toBe(17);
    const kathmandu = utcToWallDate(
      "2026-06-15T10:00:00.000Z",
      "Asia/Kathmandu",
    );
    expect([kathmandu.getHours(), kathmandu.getMinutes()]).toEqual([15, 45]);
  });
});

describe("outgoingIso preserves untouched instants across DST hazards", () => {
  // Case A: the Bangkok wall clock lands in the browser's spring-forward gap,
  // so the shell Date is normalised an hour forward.
  it("Case A: survives a gap in the browser's own zone", () => {
    const iso = "2026-03-07T19:30:00.000Z";
    const tz = "Asia/Bangkok";

    withTimeZone("America/New_York", () => {
      // The hazard is real: 02:30 does not exist in New York on 2026-03-08.
      expect(utcToWallDate(iso, tz).getHours()).toBe(3);
      expect(legacyRoundTrip(iso, tz)).toBe("2026-03-07T20:30:00.000Z");

      // The fix: an untouched field never goes through that conversion.
      expect(outgoingIso(initDateField(iso, tz), tz)).toBe(iso);
    });
  });

  // Case B: 01:30 occurs twice in New York on 2026-11-01 and moment always
  // resolves the earlier (EDT) offset, collapsing the second occurrence.
  it("Case B: survives an ambiguous fall-back hour in the selected zone", () => {
    const iso = "2026-11-01T06:30:00.000Z";
    const tz = "America/New_York";

    // Browser-zone independent - this one fires on a non-DST dev machine too.
    expect(legacyRoundTrip(iso, tz)).toBe("2026-11-01T05:30:00.000Z");
    expect(outgoingIso(initDateField(iso, tz), tz)).toBe(iso);
  });

  it("survives a timezone switch on an untouched field", () => {
    const iso = "2026-11-01T06:30:00.000Z";
    let field = initDateField(iso, "Asia/Bangkok");

    field = retimeDateField(field, "Asia/Bangkok", "America/New_York");

    // Re-derived from the stored instant, so the display is the real wall
    // clock and saving still sends the original instant back unchanged.
    expect(field.value?.getHours()).toBe(1);
    expect(outgoingIso(field, "America/New_York")).toBe(iso);
  });
});

describe("dirty tracking", () => {
  it("sends null once a date is cleared", () => {
    const field = markDateField(
      initDateField("2026-06-15T10:00:00.000Z", "UTC"),
      null,
    );
    expect(outgoingIso(field, "UTC")).toBeNull();
  });

  it("sends null for a record that never had a date", () => {
    expect(outgoingIso(initDateField(undefined, "UTC"), "UTC")).toBeNull();
  });

  it("converts an edited date from the selected zone", () => {
    // 17:00 wall clock in Bangkok is 10:00Z.
    const edited = new Date(2026, 5, 15, 17, 0, 0);
    const field = markDateField(
      initDateField(undefined, "Asia/Bangkok"),
      edited,
    );
    expect(outgoingIso(field, "Asia/Bangkok")).toBe("2026-06-15T10:00:00.000Z");
  });

  it("keeps an edited date editable across a timezone switch", () => {
    const edited = new Date(2026, 5, 15, 17, 0, 0);
    let field = markDateField(initDateField(undefined, "Asia/Bangkok"), edited);

    field = retimeDateField(field, "Asia/Bangkok", "UTC");

    expect(field.dirty).toBe(true);
    expect(field.value?.getHours()).toBe(10);
    expect(outgoingIso(field, "UTC")).toBe("2026-06-15T10:00:00.000Z");
  });
});
