import type {
  PropertyEditorDefinition,
  ToolDefinition,
} from "../types";
import {
  definePropertyEditor,
  defineTool,
} from "../core/tools-api";

export interface UnlayerShimGlobal {
  registerTool(def: ToolDefinition): void;
  registerPropertyEditor(def: PropertyEditorDefinition): void;
  createWidget<T>(cfg: PropertyEditorDefinition<T>): PropertyEditorDefinition<T>;
  createViewer<T>(cfg: { render(values: T): string }): { render(values: T): string };
}

export function installUnlayerShim(target: Window = window): UnlayerShimGlobal {
  const shim: UnlayerShimGlobal = {
    registerTool(def) {
      defineTool(def);
    },
    registerPropertyEditor(def) {
      definePropertyEditor(def);
    },
    createWidget(cfg) {
      return cfg;
    },
    createViewer(cfg) {
      return cfg;
    },
  };

  (target as unknown as { unlayer: UnlayerShimGlobal }).unlayer = shim;
  return shim;
}
