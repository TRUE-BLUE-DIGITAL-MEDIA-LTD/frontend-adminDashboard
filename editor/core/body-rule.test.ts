import { describe, expect, it } from "vitest";
import { mergeBodyIntoWrapper } from "./body-rule";

describe("mergeBodyIntoWrapper", () => {
  it("moves body-only declarations onto the wrapper", () => {
    expect(
      mergeBodyIntoWrapper(
        { "background-image": 'url("a.jpg") !important', "min-height": "100vh" },
        { "background-color": "#000000 !important" },
      ),
    ).toEqual({
      "background-color": "#000000 !important",
      "background-image": 'url("a.jpg") !important',
      "min-height": "100vh",
    });
  });

  it("keeps the wrapper's value when both set it (id beats body)", () => {
    expect(
      mergeBodyIntoWrapper({ color: "red" }, { color: "blue" }),
    ).toEqual({ color: "blue" });
    expect(
      mergeBodyIntoWrapper(
        { "background-color": "rgb(0, 0, 0) !important" },
        { "background-color": "#111 !important" },
      ),
    ).toEqual({ "background-color": "#111 !important" });
  });

  it("lets an !important body value beat a normal wrapper value", () => {
    expect(
      mergeBodyIntoWrapper({ color: "red !important" }, { color: "blue" }),
    ).toEqual({ color: "red !important" });
  });
});
