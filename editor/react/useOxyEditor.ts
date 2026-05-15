import { useRef } from "react";
import type { OxyEditorRef } from "./OxyEditor";
import type { EditorInstance } from "../types";

export function useOxyEditor() {
  const ref = useRef<OxyEditorRef | null>(null);

  function withEditor<R>(fn: (editor: EditorInstance) => R): R | null {
    const editor = ref.current?.editor;
    if (!editor) return null;
    return fn(editor);
  }

  return { ref, withEditor };
}
