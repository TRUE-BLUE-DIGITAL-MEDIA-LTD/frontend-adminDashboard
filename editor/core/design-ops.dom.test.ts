// @vitest-environment jsdom
import grapesjs, { type Component, type Editor } from "grapesjs";
import { afterEach, describe, expect, it } from "vitest";
import { applyDesignOp, resolveRef } from "./design-ops";

// Same fixture and refs as the server's refs.spec.ts: the two sides must agree.
const FIXTURE =
  '<section id="hero"><h1>Hi</h1><p>One</p><p>Two</p></section>' +
  '<section><div><a href="#">x</a></div></section>' +
  '<section id="dup"></section><div id="dup"></div>';

let editor: Editor | null = null;

function load(html = FIXTURE): Editor {
  editor = grapesjs.init({ headless: true, storageManager: false });
  editor.setComponents(html);
  return editor;
}

afterEach(() => {
  editor?.destroy();
  editor = null;
});

describe("resolveRef", () => {
  it("resolves the refs the server computes", () => {
    const wrapper = load().getWrapper()!;
    expect(resolveRef(wrapper, "#hero")?.getId()).toBe("hero");
    expect(resolveRef(wrapper, "body>section:nth-of-type(1)>p:nth-of-type(2)")?.toHTML()).toContain("Two");
    expect(resolveRef(wrapper, "body>section:nth-of-type(2)>div:nth-of-type(1)>a:nth-of-type(1)")?.get("tagName")).toBe("a");
    expect(resolveRef(wrapper, "body>section:nth-of-type(3)")?.getId()).toBe("dup");
    // GrapesJS renames the second duplicate id (dup -> dup-2); the path ref still resolves it.
    expect(resolveRef(wrapper, "body>div:nth-of-type(1)")?.get("tagName")).toBe("div");
    expect(resolveRef(wrapper, "body>div:nth-of-type(1)")?.getId()).toMatch(/^dup/);
    expect(resolveRef(wrapper, " body > section:nth-of-type(1) > h1:nth-of-type(1) ")?.toHTML()).toContain("Hi");
    expect(resolveRef(wrapper, "body")).toBe(wrapper);
  });

  it("returns null for refs that do not match", () => {
    const wrapper = load().getWrapper()!;
    for (const ref of ["body>section:nth-of-type(9)", "section", "#bad id", "#missing", "body>section:nth-child(1)"]) {
      expect(resolveRef(wrapper, ref)).toBeNull();
    }
  });
});

describe("applyDesignOp", () => {
  const topIds = () => editor!.getWrapper()!.components().map((c: Component) => c.getId());

  it("replaces an element", () => {
    const e = load();
    expect(applyDesignOp(e, { kind: "replace", ref: "#hero", html: '<section id="hero"><h1>New</h1></section>' })).toEqual({ status: "applied" });
    expect(e.getHtml()).toContain("New");
    expect(e.getHtml()).not.toContain("One");
  });

  it("inserts in all four positions", () => {
    const op = (position: "before" | "after" | "inside_start" | "inside_end") =>
      ({ kind: "insert", ref: "#hero", position, html: '<p id="n">N</p>' }) as const;
    applyDesignOp(load(), op("before"));
    expect(topIds().slice(0, 2)).toEqual(["n", "hero"]);
    applyDesignOp(load(), op("after"));
    expect(topIds().slice(0, 2)).toEqual(["hero", "n"]);
    const e1 = load();
    applyDesignOp(e1, op("inside_start"));
    expect(resolveRef(e1.getWrapper()!, "#hero")!.components().at(0).getId()).toBe("n");
    const e2 = load();
    applyDesignOp(e2, op("inside_end"));
    const hero = resolveRef(e2.getWrapper()!, "#hero")!;
    expect(hero.components().at(hero.components().length - 1).getId()).toBe("n");
  });

  it("inserts at the end of body", () => {
    const e = load();
    expect(applyDesignOp(e, { kind: "insert", ref: "body", position: "inside_end", html: '<footer id="f">F</footer>' }).status).toBe("applied");
    expect(topIds().pop()).toBe("f");
  });

  it("removes an element", () => {
    const e = load();
    applyDesignOp(e, { kind: "remove", ref: "body>section:nth-of-type(2)" });
    expect(e.getHtml()).not.toContain('href="#"');
  });

  it("adds css rules and replaces the full page", () => {
    const e = load();
    applyDesignOp(e, { kind: "css", css: ".cta{color:red}" });
    // getCss() drops rules whose selector no component uses yet; the rule is still stored.
    expect(e.getCss({ keepUnusedStyles: true })).toMatch(/\.cta\{color:red;?\}/);
    applyDesignOp(e, { kind: "full", html: '<main id="m">x</main>', css: "#m{color:blue}" });
    expect(e.getHtml()).toContain('id="m"');
    expect(e.getHtml()).not.toContain("hero");
    expect(e.getCss()).toMatch(/#m\{color:blue;?\}/);
  });

  it("skips refs that do not resolve and never replaces or removes body", () => {
    const e = load();
    expect(applyDesignOp(e, { kind: "remove", ref: "#missing" })).toEqual({ status: "skipped", reason: "No element matches #missing" });
    expect(applyDesignOp(e, { kind: "replace", ref: "body", html: "<p>x</p>" }).status).toBe("skipped");
    expect(applyDesignOp(e, { kind: "insert", ref: "body", position: "before", html: "<p>x</p>" }).status).toBe("skipped");
  });
});
