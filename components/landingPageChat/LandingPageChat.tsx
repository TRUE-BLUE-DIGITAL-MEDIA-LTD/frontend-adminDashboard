import { RefObject, useCallback, useEffect, useState, type ReactNode } from "react";
import { LuPanelRightOpen, LuSparkles } from "react-icons/lu";
import type { OxyEditorRef } from "../../editor/react/OxyEditor";
import ChatPanel, { type ChatStatus } from "./ChatPanel";

const COLLAPSED_KEY = "lp-chat:collapsed";

interface Props {
  landingPageId?: string;
  editorRef: RefObject<OxyEditorRef | null>;
  /** The editor area; the chat docks to its right. */
  children: ReactNode;
}

/**
 * Lays the editor out with the AI chat docked on the right. Collapsing only
 * hides the panel: it stays mounted so its socket keeps applying AI edits.
 */
export default function LandingPageChat({ landingPageId, editorRef, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<ChatStatus>({ running: false, assistant: "AI" });

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // Storage unavailable (private mode): default to open.
    }
  }, []);

  const toggle = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Not persisting is fine.
    }
  };

  const onStatusChange = useCallback((next: ChatStatus) => {
    setStatus((prev) => (prev.running === next.running && prev.assistant === next.assistant ? prev : next));
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-stretch">
      <div className={`relative min-w-0 flex-1 rounded-xl transition-shadow ${status.running ? "ring-2 ring-blue-500/50" : ""}`}>
        {children}
        {status.running && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            {status.assistant} is editing…
          </div>
        )}
      </div>

      {landingPageId && (
        <>
          {collapsed && (
            <button
              type="button"
              onClick={() => toggle(false)}
              aria-label="Open AI chat"
              title="Open AI chat"
              className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-panel text-fg-muted hover:text-fg lg:h-[40rem] lg:w-11 lg:flex-col lg:justify-start lg:py-3"
            >
              <LuPanelRightOpen className="h-4 w-4" />
              <LuSparkles className="h-4 w-4 text-blue-500" />
              {status.running && <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />}
              <span className="text-xs lg:[writing-mode:vertical-rl]">AI Design</span>
            </button>
          )}
          <div className={collapsed ? "hidden" : "h-[40rem] w-full shrink-0 lg:w-[380px]"}>
            <ChatPanel
              landingPageId={landingPageId}
              editorRef={editorRef}
              onCollapse={() => toggle(true)}
              onStatusChange={onStatusChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
