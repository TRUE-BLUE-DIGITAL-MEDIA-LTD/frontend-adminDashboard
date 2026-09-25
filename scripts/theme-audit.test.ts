import { describe, expect, it } from "vitest";
// @ts-ignore — plain ESM script; allowJs may or may not type it, so ignore rather than expect-error
import { auditSource } from "./theme-audit.mjs";

const hits = (src: string) =>
  (auditSource(src) as { line: number; cls: string }[]).map((h) => h.cls);

describe("auditSource", () => {
  it("flags neutral classes from both dialects", () => {
    expect(
      hits(`<div className="bg-zinc-900 border-white/10 text-gray-700 hover:bg-white/5 md:bg-black">`),
    ).toEqual(["bg-zinc-900", "border-white/10", "text-gray-700", "hover:bg-white/5", "md:bg-black"]);
  });

  it("flags text-white on a neutral panel", () => {
    expect(hits(`<p className="bg-panel text-white">`)).toEqual(["text-white"]);
  });

  it("allows text-white on brand, status, or gradient backgrounds on the same line", () => {
    expect(hits(`<button className="bg-main-color text-white hover:text-white">`)).toEqual([]);
    expect(hits(`<span className="rounded bg-red-500 text-white">`)).toEqual([]);
    expect(hits(`<div className="gradient-gold text-white">`)).toEqual([]);
  });

  it("does not treat a status tint as a solid background", () => {
    expect(hits(`<span className="bg-green-500/10 text-white">`)).toEqual(["text-white"]);
  });

  it("flags pale status tints that become white blobs in Dark", () => {
    expect(hits(`<span className="bg-green-100 text-green-700 hover:bg-blue-50">`)).toEqual([
      "bg-green-100",
      "hover:bg-blue-50",
    ]);
    expect(hits(`<span className="bg-green-500/15 bg-red-500 bg-green-100/50">`)).toEqual([]);
  });

  it("honours the ignore marker", () => {
    expect(hits(`<div className="bg-white"> {/* theme-audit-ignore */}`)).toEqual([]);
  });

  it("ignores token classes and non-neutral colors", () => {
    expect(hits(`<div className="bg-panel text-fg-muted border-line text-red-400 bg-main-color">`)).toEqual([]);
  });

  it("reports 1-based line numbers", () => {
    expect(auditSource(`const a = 1;\n<div className="bg-black" />`)).toEqual([
      { line: 2, cls: "bg-black" },
    ]);
  });
});
