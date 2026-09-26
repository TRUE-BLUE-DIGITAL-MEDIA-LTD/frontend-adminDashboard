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

  it("allows text-white when the accent background is on one of the two previous lines", () => {
    const src = `<button\n  className="rounded-lg bg-blue-500 px-20 py-2\n  font-Poppins text-lg text-white"\n>`;
    expect(auditSource(src)).toEqual([]);
    const far = `<div className="bg-blue-500">\n\n\n<p className="text-white">`;
    expect(auditSource(far)).toEqual([{ line: 4, cls: "text-white" }]);
  });

  it("ignores gradient stops (decorative, not surfaces)", () => {
    expect(hits(`<div className="bg-gradient-to-r from-neutral-300 to-stone-400 text-white">`)).toEqual([]);
  });

  it("allows text-black on a solid accent (e.g. green-400 buttons) but not on neutrals", () => {
    expect(hits(`<button className="rounded-lg bg-green-400 px-10 font-bold text-black">`)).toEqual([]);
    expect(hits(`<p className="bg-panel text-black">`)).toEqual(["text-black"]);
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

  it("flags a Prime overlay component without panelClassName", () => {
    const src = [
      `import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";`,
      `<Dropdown`,
      `  value={v}`,
      `  onChange={(e) => set(e.value)}`,
      `/>`,
      `<Dropdown panelClassName="oxy-overlay-panel" value={v} />`,
    ].join("\n");
    expect(auditSource(src)).toEqual([{ line: 2, cls: "Dropdown without panelClassName" }]);
  });

  it("flags hardcoded color-scheme and arbitrary neutral hex classes", () => {
    expect(hits(`<input className="[color-scheme:dark] bg-[#fff] text-[#000000] text-[#62C7D8]">`)).toEqual([
      "[color-scheme:dark]",
      "bg-[#fff]",
      "text-[#000000]",
    ]);
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
