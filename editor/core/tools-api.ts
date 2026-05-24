import type { PropertyEditorDefinition, ToolDefinition } from "../types";

const toolRegistry = new Map<string, ToolDefinition>();
const propertyEditorRegistry = new Map<string, PropertyEditorDefinition>();

export function defineTool<T extends Record<string, unknown>>(
  tool: ToolDefinition<T>,
): void {
  toolRegistry.set(tool.name, tool as unknown as ToolDefinition);
}

export function definePropertyEditor<T>(
  editor: PropertyEditorDefinition<T>,
): void {
  propertyEditorRegistry.set(editor.name, editor as PropertyEditorDefinition);
}

export function getRegisteredTools(): ReadonlyMap<string, ToolDefinition> {
  return toolRegistry;
}

export function getRegisteredPropertyEditors(): ReadonlyMap<
  string,
  PropertyEditorDefinition
> {
  return propertyEditorRegistry;
}
