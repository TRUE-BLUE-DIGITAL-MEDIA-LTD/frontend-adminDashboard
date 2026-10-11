import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { replaceOwnText, restoreOwnText, type OwnTextMemo } from "./i18n-text";

function el(html: string): Element {
  const doc = new JSDOM(`<body>${html}</body>`).window.document;
  return doc.body.firstElementChild!;
}

describe("replaceOwnText", () => {
  it("keeps styled child elements of a mixed-content parent", () => {
    const p = el('<p>Get <span style="color:orange">50% off</span> today</p>');
    replaceOwnText(p, "Hoy");
    expect(p.innerHTML).toBe('Hoy <span style="color:orange">50% off</span> ');
  });

  it("keeps <br> and attributes on the element itself", () => {
    const h = el('<h1 style="color:orange">Buy now<br></h1>');
    replaceOwnText(h, "Compra ahora");
    expect(h.outerHTML).toBe('<h1 style="color:orange">Compra ahora<br></h1>');
  });

  it("does nothing when the text already matches", () => {
    const p = el("<p>Get <b>50%</b> today</p>");
    replaceOwnText(p, "Get  today");
    expect(p.innerHTML).toBe("Get <b>50%</b> today");
  });

  it("restores the original split after previewing another language", () => {
    const memo: OwnTextMemo = new WeakMap();
    const p = el("<p>Get <b>50%</b> today</p>");
    replaceOwnText(p, "Hoy", memo);
    restoreOwnText(p, memo);
    expect(p.innerHTML).toBe("Get <b>50%</b> today");
  });

  it("does not revert text edited after the preview wrote it", () => {
    const memo: OwnTextMemo = new WeakMap();
    const p = el("<p>Hello</p>");
    replaceOwnText(p, "Hola", memo);
    (p.firstChild as Text).data = "Edited";
    restoreOwnText(p, memo);
    expect(p.textContent).toBe("Edited");
  });
});
