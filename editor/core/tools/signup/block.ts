import type { Editor as GrapesEditor, Component } from "grapesjs";
import {
  DEFAULT_SIGNUP_PROPS,
  SIGNUP_LABEL_KEYS,
  SIGNUP_MARKER_CLASS,
  SIGNUP_MERCHANTS,
  readSignupAttrs,
  renderSignupInnerHtml,
  signupDataAttrs,
  type SignupLabelKey,
  type SignupProps,
} from "./render";

/**
 * Dating Signup block — a registration form for a merchant "Profile API".
 * See render.ts for the DOM contract and where the request is sent.
 *
 * Every setting is a flat component prop edited through GrapesJS traits. The
 * inner DOM is derived from those props and rebuilt on each change, so the
 * children are locked (clicking anywhere selects the form) and the rebuild is
 * kept out of the undo stack — same approach as the quiz block.
 */

export const SIGNUP_COMPONENT_TYPE = "oxy-signup";

const LABEL_PROP: Record<SignupLabelKey, string> = {
  email: "signup-label-email",
  username: "signup-label-username",
  password: "signup-label-password",
  gender: "signup-label-gender",
  searchGender: "signup-label-search-gender",
  birthdate: "signup-label-birthdate",
  optionMale: "signup-option-male",
  optionFemale: "signup-option-female",
  msgEmailExists: "signup-msg-email-exists",
  msgUsernameExists: "signup-msg-username-exists",
  msgGeneric: "signup-msg-generic",
};

const LABEL_TRAIT_NAME: Record<SignupLabelKey, string> = {
  email: "Email label",
  username: "Username label",
  password: "Password label",
  gender: "Gender label",
  searchGender: "Looking-for label",
  birthdate: "Birthdate label",
  optionMale: "Option: man",
  optionFemale: "Option: woman",
  msgEmailExists: "Message: email taken",
  msgUsernameExists: "Message: username taken",
  msgGeneric: "Message: other error",
};

const PROP_NAMES = [
  "signup-id",
  "signup-merchant",
  "signup-cid",
  "signup-source",
  "signup-subsource",
  "signup-button-text",
  "signup-button-color",
  "signup-button-text-color",
  ...SIGNUP_LABEL_KEYS.map((k) => LABEL_PROP[k]),
];

// Set at registration so rerender() can skip the undo stack. One editor is
// mounted at a time (see react/OxyEditor.tsx).
let activeGrapes: GrapesEditor | null = null;

function newSignupId(): string {
  // Matches the /^[a-z0-9]{1,16}$/ check in readSignupAttrs.
  return Math.random().toString(36).slice(2, 8) || "a";
}

function skipHistory(fn: () => void): void {
  if (activeGrapes) activeGrapes.UndoManager.skip(fn);
  else fn();
}

type ComponentLike = Component & {
  get: (key: string) => unknown;
  set: (key: string, value: unknown, opts?: unknown) => void;
  components: (next?: unknown) => unknown;
  addAttributes: (attrs: Record<string, string>) => Component;
  on: (events: string, cb: (...args: unknown[]) => void) => Component;
};

function asLike(c: Component): ComponentLike {
  return c as unknown as ComponentLike;
}

function propsToModel(p: SignupProps): Record<string, string> {
  const model: Record<string, string> = {
    "signup-id": p.id,
    "signup-merchant": p.merchant,
    "signup-cid": p.cid,
    "signup-source": p.source,
    "signup-subsource": p.subsource,
    "signup-button-text": p.buttonText,
    "signup-button-color": p.buttonColor,
    "signup-button-text-color": p.buttonTextColor,
  };
  for (const key of SIGNUP_LABEL_KEYS) model[LABEL_PROP[key]] = p.labels[key];
  return model;
}

function readProps(comp: Component): SignupProps {
  const c = asLike(comp);
  const d = DEFAULT_SIGNUP_PROPS;
  const str = (name: string, fallback: string): string => {
    const raw = c.get(name);
    return typeof raw === "string" && raw !== "" ? raw : fallback;
  };
  const labels = {} as Record<SignupLabelKey, string>;
  for (const key of SIGNUP_LABEL_KEYS) {
    labels[key] = str(LABEL_PROP[key], d.labels[key]);
  }
  return {
    id: str("signup-id", ""),
    merchant: str("signup-merchant", d.merchant),
    cid: str("signup-cid", ""),
    source: str("signup-source", ""),
    subsource: str("signup-subsource", ""),
    buttonText: str("signup-button-text", d.buttonText),
    buttonColor: str("signup-button-color", d.buttonColor),
    buttonTextColor: str("signup-button-text-color", d.buttonTextColor),
    labels,
  };
}

function walk(comp: unknown, visit: (c: ComponentLike) => void): void {
  const c = comp as ComponentLike | undefined;
  if (!c) return;
  visit(c);
  const children = c.components?.() as
    | { length: number; at: (i: number) => unknown }
    | undefined;
  const len = children?.length ?? 0;
  for (let i = 0; i < len; i++) walk(children!.at(i), visit);
}

/** Lock every descendant so the form behaves as one unit on the canvas. */
function lockChildren(root: Component): void {
  const children = asLike(root).components() as {
    length: number;
    at: (i: number) => unknown;
  };
  const len = children?.length ?? 0;
  for (let i = 0; i < len; i++) {
    walk(children.at(i), (c) => {
      c.set("selectable", false);
      c.set("hoverable", false);
      c.set("draggable", false);
      c.set("removable", false);
      c.set("copyable", false);
      c.set("layerable", false);
    });
  }
}

function rerender(root: Component): void {
  const props = readProps(root);
  const like = asLike(root);
  // Children are derived state: only the prop change belongs in the undo
  // stack. Undoing the prop re-fires this handler and rebuilds.
  skipHistory(() => {
    like.components(renderSignupInnerHtml(props));
    like.addAttributes(signupDataAttrs(props));
    lockChildren(root);
  });
}

function defineComponentType(grapes: GrapesEditor): void {
  grapes.Components.addType(SIGNUP_COMPONENT_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(SIGNUP_MARKER_CLASS)) return undefined;
      return {
        type: SIGNUP_COMPONENT_TYPE,
        ...propsToModel(readSignupAttrs((name) => el.getAttribute(name))),
      };
    },
    model: {
      defaults: {
        name: "Dating Signup",
        tagName: "form",
        droppable: false,
        // Cloning would strip the children's data-i18n keys (see the
        // component:clone handler in core/plugins/i18n-keys.ts).
        copyable: false,
        ...propsToModel(DEFAULT_SIGNUP_PROPS),
        // `novalidate` is absent on purpose: the lander runtime calls
        // reportValidity() to get the browser's own localized messages.
        attributes: { class: SIGNUP_MARKER_CLASS },
        traits: [
          {
            type: "select",
            name: "signup-merchant",
            label: "Merchant",
            options: SIGNUP_MERCHANTS.map((m) => ({ id: m.id, name: m.name })),
            changeProp: 1,
          },
          {
            type: "text",
            name: "signup-button-text",
            label: "Button text",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "signup-button-color",
            label: "Button color",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "signup-button-text-color",
            label: "Button text color",
            changeProp: 1,
          },
          ...SIGNUP_LABEL_KEYS.map((key) => ({
            type: "text",
            name: LABEL_PROP[key],
            label: LABEL_TRAIT_NAME[key],
            changeProp: 1,
          })),
          {
            type: "text",
            name: "signup-cid",
            label: "Default cid",
            changeProp: 1,
          },
          {
            type: "text",
            name: "signup-source",
            label: "Default source",
            changeProp: 1,
          },
          {
            type: "text",
            name: "signup-subsource",
            label: "Default subsource",
            changeProp: 1,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        asLike(comp).on(
          PROP_NAMES.map((name) => `change:${name}`).join(" "),
          () => rerender(comp),
        );
        const like = asLike(comp);
        if (!like.get("signup-id")) {
          like.set("signup-id", newSignupId(), { silent: true });
        }
        const children = like.components() as { length: number } | undefined;
        if (children && children.length > 0) {
          // Hydrated from saved data or HTML: the children already carry the
          // ids their exported CSS rules are keyed to. Rebuilding them here
          // would mint new ids and orphan that CSS (e.g. when a design op
          // applies html first and css second) — so only re-lock them.
          skipHistory(() => {
            like.addAttributes(signupDataAttrs(readProps(comp)));
            lockChildren(comp);
          });
        } else {
          // Fresh drop: build the children from the props.
          rerender(comp);
        }
      },
    },
  });
}

export function registerSignupBlock(
  grapes: GrapesEditor,
  opts: { blockCategory: string; icon: string },
): void {
  activeGrapes = grapes;
  defineComponentType(grapes);

  // The block itself is not copyable, but duplicating a container that holds
  // one still clones it — with the original's id, hence the original's
  // translation keys. Give every cloned block a fresh id; the prop change
  // re-renders its children with their own keys.
  grapes.on("component:clone", (cloned: unknown) => {
    walk(cloned, (c) => {
      if (c.get("type") === SIGNUP_COMPONENT_TYPE) {
        skipHistory(() => c.set("signup-id", newSignupId()));
      }
    });
  });

  grapes.BlockManager.add("oxy-signup", {
    label: "Dating Signup",
    category: opts.blockCategory,
    media: opts.icon,
    content: {
      type: SIGNUP_COMPONENT_TYPE,
      style: {
        display: "flex",
        "flex-direction": "column",
        gap: "12px",
        "max-width": "420px",
        margin: "0 auto",
        padding: "16px",
        background: "#ffffff",
        "border-radius": "8px",
      },
    },
  });
}
