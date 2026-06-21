import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconBaseProps } from "react-icons";
import {
  BiText,
  BiHeading,
  BiImage,
  BiCodeAlt,
  BiMenu,
  BiGroup,
  BiTimer,
  BiClipboard,
  BiStar,
  BiRectangle,
  BiLink,
  BiMap,
  BiSolidQuoteAltLeft,
  BiColumns,
  BiEditAlt,
  BiSelectMultiple,
  BiCheckboxChecked,
  BiText as BiTextarea,
  BiTask,
  BiListUl,
  BiListCheck,
} from "react-icons/bi";
import { MdHorizontalRule, MdSubtitles } from "react-icons/md";
import type { Editor as GrapesEditor } from "grapesjs";
import { registerMultipleFormBlock } from "./multiple-form";
import { registerFormBlock } from "./form";
import { registerQuizBlock } from "../../core/tools/quiz/block";

export const builtInToolNames = [
  // Content
  "text",
  "heading",
  "image",
  "button",
  "link",
  "divider",
  "html",
  "menu",
  "social",
  "column",
  "quote",
  "map",
  "text-section",
  // Form
  "form",
  "input",
  "textarea",
  "checkbox",
  "label",
  // Extra / custom
  "multiple-form",
  "quiz",
] as const;

export type BuiltInToolName = (typeof builtInToolNames)[number];

export interface RegisterBuiltInToolsOptions {
  include?: ReadonlyArray<BuiltInToolName>;
}

function iconHtml(Icon: ComponentType<IconBaseProps>): string {
  return renderToStaticMarkup(createElement(Icon, { size: 28 }));
}

const ICONS: Record<BuiltInToolName, string> = {
  text: iconHtml(BiText),
  heading: iconHtml(BiHeading),
  image: iconHtml(BiImage),
  button: iconHtml(BiRectangle),
  link: iconHtml(BiLink),
  divider: iconHtml(MdHorizontalRule),
  html: iconHtml(BiCodeAlt),
  menu: iconHtml(BiMenu),
  social: iconHtml(BiGroup),
  column: iconHtml(BiColumns),
  quote: iconHtml(BiSolidQuoteAltLeft),
  map: iconHtml(BiMap),
  "text-section": iconHtml(MdSubtitles),
  form: iconHtml(BiClipboard),
  input: iconHtml(BiEditAlt),
  textarea: iconHtml(BiTextarea),

  checkbox: iconHtml(BiCheckboxChecked),
  label: iconHtml(BiTask),
  "multiple-form": iconHtml(BiListUl),
  quiz: iconHtml(BiListCheck),
};

const CATEGORY_CONTENT = "Content";
const CATEGORY_SECTIONS = "Sections";
const CATEGORY_FORM = "Form";
const CATEGORY_EXTRA = "Extra";
const CATEGORY_CUSTOM = "Custom";

export function registerBuiltInTools(
  grapes: GrapesEditor,
  options: RegisterBuiltInToolsOptions = {},
): void {
  const include = new Set<BuiltInToolName>(options.include ?? builtInToolNames);
  const bm = grapes.BlockManager;
  if (include.has("text")) {
    bm.add("oxy-text", {
      label: "Text",
      category: CATEGORY_CONTENT,
      media: ICONS.text,
      content: {
        type: "text",
        content: "Insert text here",
        attributes: { class: "oxy-text-block" },
        style: {
          padding: "12px",
          "font-size": "16px",
          color: "#374151",
          "line-height": "1.5",
        },
      },
    });
  }
  if (include.has("heading")) {
    bm.add("oxy-heading", {
      label: "Heading",
      category: CATEGORY_CONTENT,
      media: ICONS.heading,
      content: {
        type: "text",
        tagName: "h1",
        content: "Heading",
        attributes: { class: "oxy-heading-block" },
        style: {
          margin: "0",
          padding: "12px",
          "font-size": "32px",
          "font-weight": "700",
          color: "#111827",
          "text-align": "left",
          "line-height": "1.2",
        },
      },
    });
  }
  if (include.has("image")) {
    // Local-file upload behavior lives in engine.ts: the AssetManager's
    // `uploadFile` callback routes picked files through cloud-storage's
    // signed PUT URL flow (`GetSignURLService` + `UploadSignURLService`)
    // and adds the resulting public URL as a selectable asset. Drop this
    // block, double-click the image, click Upload — the dialog calls
    // into that flow automatically.
    bm.add("oxy-image", {
      label: "Image",
      category: CATEGORY_CONTENT,
      media: ICONS.image,
      content: {
        type: "image",
        attributes: { class: "oxy-image-block", alt: "" },
        style: {
          padding: "8px",
          "max-width": "100%",
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
        },
      },
    });
  }
  if (include.has("button")) {
    bm.add("oxy-button", {
      label: "Button",
      category: CATEGORY_CONTENT,
      media: ICONS.button,
      content: {
        type: "link",
        attributes: { href: "", class: "oxy-button-block" },
        content: "Button",
        style: {
          display: "inline-block",
          padding: "12px 24px",
          background: "#2563eb",
          color: "#ffffff",
          "text-decoration": "none",
          "border-radius": "8px",
          "font-size": "16px",
          "font-weight": "600",
          "text-align": "center",
        },
      },
    });
  }
  if (include.has("divider")) {
    bm.add("oxy-divider", {
      label: "Divider",
      category: CATEGORY_CONTENT,
      media: ICONS.divider,
      content: {
        tagName: "hr",
        attributes: { class: "oxy-divider-block" },
        style: {
          "border-top": "1px solid #e5e7eb",
          "border-right": "0",
          "border-bottom": "0",
          "border-left": "0",
          margin: "12px 0",
        },
      },
    });
  }
  if (include.has("html")) {
    bm.add("oxy-html", {
      label: "HTML",
      category: CATEGORY_CONTENT,
      media: ICONS.html,
      content: {
        tagName: "div",
        attributes: { class: "oxy-html-block" },
        components: `<div style="padding:12px;font-family:monospace;color:#6b7280;background:#f9fafb;border:1px dashed #e5e7eb;border-radius:6px;">Custom HTML</div>`,
        style: { padding: "8px" },
      },
    });
  }
  if (include.has("menu")) {
    bm.add("oxy-menu", {
      label: "Menu",
      category: CATEGORY_CONTENT,
      media: ICONS.menu,
      content: {
        tagName: "nav",
        attributes: { class: "oxy-menu-block" },
        components: `<a href="#" style="margin-right:16px;color:#111827;text-decoration:none;font-weight:500;">Home</a><a href="#" style="margin-right:16px;color:#111827;text-decoration:none;font-weight:500;">About</a><a href="#" style="color:#111827;text-decoration:none;font-weight:500;">Contact</a>`,
        style: {
          padding: "12px",
          "text-align": "center",
          background: "#ffffff",
        },
      },
    });
  }
  if (include.has("social")) {
    bm.add("oxy-social", {
      label: "Social",
      category: CATEGORY_CONTENT,
      media: ICONS.social,
      content: {
        tagName: "div",
        attributes: { class: "oxy-social-block" },
        components: `<a href="#" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#1877f2;color:#fff;text-align:center;line-height:36px;text-decoration:none;margin:0 4px;font-weight:700;">f</a><a href="#" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#1da1f2;color:#fff;text-align:center;line-height:36px;text-decoration:none;margin:0 4px;font-weight:700;">t</a><a href="#" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#e1306c;color:#fff;text-align:center;line-height:36px;text-decoration:none;margin:0 4px;font-weight:700;">i</a>`,
        style: { padding: "12px", "text-align": "center" },
      },
    });
  }

  if (include.has("form")) {
    registerFormBlock(grapes, {
      blockCategory: CATEGORY_FORM,
      icon: ICONS.form,
    });
  }
  if (include.has("link")) {
    bm.add("oxy-link", {
      label: "Link",
      category: CATEGORY_CONTENT,
      media: ICONS.link,
      content: {
        type: "link",
        attributes: { href: "https://example.com", class: "oxy-link-block" },
        content: "Link text",
        style: {
          color: "#2563eb",
          "text-decoration": "underline",
          "font-size": "16px",
        },
      },
    });
  }
  if (include.has("column")) {
    // Two-column 1:1 grid section. Each column accepts dropped components.
    bm.add("oxy-column", {
      label: "2 Columns",
      category: CATEGORY_SECTIONS,
      media: ICONS.column,
      content: {
        tagName: "div",
        attributes: { class: "oxy-row-block" },
        style: {
          display: "grid",
          "grid-template-columns": "1fr 1fr",
          gap: "16px",
          padding: "16px",
        },
        components: [
          {
            tagName: "div",
            attributes: { class: "oxy-col-block" },
            style: {
              padding: "16px",
              "min-height": "60px",
              background: "#f9fafb",
              "border-radius": "6px",
            },
            components: "Column 1",
          },
          {
            tagName: "div",
            attributes: { class: "oxy-col-block" },
            style: {
              padding: "16px",
              "min-height": "60px",
              background: "#f9fafb",
              "border-radius": "6px",
            },
            components: "Column 2",
          },
        ],
      },
    });
  }
  if (include.has("quote")) {
    bm.add("oxy-quote", {
      label: "Quote",
      category: CATEGORY_CONTENT,
      media: ICONS.quote,
      content: {
        tagName: "blockquote",
        attributes: { class: "oxy-quote-block" },
        components:
          '<p style="margin:0;font-style:italic;color:#374151;font-size:18px;line-height:1.5;">“A great quote that captures your value proposition.”</p><cite style="display:block;margin-top:8px;font-style:normal;color:#6b7280;font-size:14px;">— Author Name</cite>',
        style: {
          padding: "16px 20px",
          "border-left": "4px solid #2563eb",
          background: "#f9fafb",
          "border-radius": "0 8px 8px 0",
          margin: "16px 0",
        },
      },
    });
  }
  if (include.has("map")) {
    // Embedded Google Maps iframe with a generic centered location.
    bm.add("oxy-map", {
      label: "Map",
      category: CATEGORY_CONTENT,
      media: ICONS.map,
      content: {
        tagName: "div",
        attributes: { class: "oxy-map-block" },
        style: { padding: "8px" },
        components: `<iframe src="https://maps.google.com/maps?q=New+York&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="280" style="border:0;border-radius:8px;display:block;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
      },
    });
  }
  if (include.has("text-section")) {
    bm.add("oxy-text-section", {
      label: "Text Section",
      category: CATEGORY_SECTIONS,
      media: ICONS["text-section"],
      content: {
        tagName: "section",
        attributes: { class: "oxy-text-section-block" },
        components: `<h2 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#111827;line-height:1.2;">Section title</h2><p style="margin:0;font-size:16px;line-height:1.6;color:#374151;">Short description that introduces the section below. Keep it concise and focused on a single idea.</p>`,
        style: {
          padding: "32px 24px",
          "max-width": "720px",
          margin: "0 auto",
          "text-align": "left",
        },
      },
    });
  }
  if (include.has("input")) {
    bm.add("oxy-input", {
      label: "Input",
      category: CATEGORY_FORM,
      media: ICONS.input,
      content: {
        tagName: "label",
        attributes: { class: "oxy-input-block" },
        components: `<span style="display:block;font-size:14px;color:#374151;margin-bottom:4px;font-weight:500;">Field label</span><input type="text" name="field" placeholder="Type here..." style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;box-sizing:border-box;" />`,
        style: {
          display: "block",
          "margin-bottom": "12px",
        },
      },
    });
  }
  if (include.has("textarea")) {
    bm.add("oxy-textarea", {
      label: "Textarea",
      category: CATEGORY_FORM,
      media: ICONS.textarea,
      content: {
        tagName: "label",
        attributes: { class: "oxy-textarea-block" },
        components: `<span style="display:block;font-size:14px;color:#374151;margin-bottom:4px;font-weight:500;">Message</span><textarea name="message" rows="4" placeholder="Your message..." style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:inherit;box-sizing:border-box;resize:vertical;"></textarea>`,
        style: { display: "block", "margin-bottom": "12px" },
      },
    });
  }

  if (include.has("checkbox")) {
    bm.add("oxy-checkbox", {
      label: "Checkbox",
      category: CATEGORY_FORM,
      media: ICONS.checkbox,
      content: {
        tagName: "label",
        attributes: { class: "oxy-checkbox-block" },
        components: `<input type="checkbox" name="agree" style="margin-right:8px;width:16px;height:16px;cursor:pointer;" /><span style="font-size:14px;color:#374151;">I agree to the terms and conditions</span>`,
        style: {
          display: "flex",
          "align-items": "center",
          "margin-bottom": "12px",
          cursor: "pointer",
        },
      },
    });
  }
  if (include.has("label")) {
    bm.add("oxy-label", {
      label: "Label",
      category: CATEGORY_FORM,
      media: ICONS.label,
      content: {
        tagName: "label",
        attributes: { class: "oxy-label-block" },
        content: "Field label",
        style: {
          display: "block",
          "font-size": "14px",
          color: "#374151",
          "font-weight": "500",
          "margin-bottom": "4px",
        },
      },
    });
  }
  if (include.has("multiple-form")) {
    registerMultipleFormBlock(grapes, {
      blockCategory: CATEGORY_EXTRA,
      icon: ICONS["multiple-form"],
    });
  }
  if (include.has("quiz")) {
    registerQuizBlock(grapes, {
      blockCategory: CATEGORY_EXTRA,
      icon: ICONS.quiz,
    });
  }
}

/**
 * Mirrors Unlayer's "Basic Custom Tool" sample.
 * https://examples.unlayer.com/custom_tools/simple-custom-tool/#basiccustomtool
 */
export interface BasicCustomToolValues {
  myText: string;
}

export const basicCustomToolDefaults: BasicCustomToolValues = {
  myText: "My Text",
};

export function renderBasicCustomTool(values: BasicCustomToolValues): string {
  const text = escapeHtml(values.myText ?? basicCustomToolDefaults.myText);
  const safeAttr = escapeAttr(values.myText ?? basicCustomToolDefaults.myText);
  return `<div class="oxy-custom-basic" data-oxy-tool="custom-basic" data-my-text="${safeAttr}" style="padding:24px;text-align:center;border:1px dashed #cbd5e1;border-radius:8px;background:#f8fafc;"><h1 style="margin:0;color:#0f172a;font-size:28px;">${text}</h1></div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
