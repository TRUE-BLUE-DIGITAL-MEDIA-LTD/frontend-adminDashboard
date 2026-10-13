import type { ReactNode } from "react";
import type { ChatState } from "./chatState";

function Banner({ tone, children }: { tone: "info" | "warn"; children: ReactNode }) {
  const cls = tone === "info"
    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
    : "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return <div className={`px-4 py-2 text-sm ${cls}`}>{children}</div>;
}

interface Props {
  state: ChatState;
  level: "ok" | "suggest" | "blocked";
  running: boolean;
  assistant: string;
  onClear: () => void;
  onSync: () => void;
}

export default function ChatBanners({ state, level, running, assistant, onClear, onSync }: Props) {
  const clearButton = (
    <button type="button" onClick={onClear} className="ml-2 font-semibold underline">
      Clear
    </button>
  );
  const needsSync = state.skippedOps > 0 || state.joinedMidTurn;
  return (
    <>
      {running && (
        <Banner tone="info">
          {assistant} is editing the page… You can keep working, but changes to the same section may be overwritten.
        </Banner>
      )}
      {level === "suggest" && (
        <Banner tone="warn">
          This conversation is getting long. Clear it to keep responses fast and cheap. The design on the canvas isn&apos;t affected.
          {clearButton}
        </Banner>
      )}
      {level === "blocked" && (
        <Banner tone="warn">
          This conversation is full. Clear it to send new prompts. Team notes still work.
          {clearButton}
        </Banner>
      )}
      {needsSync && (
        <Banner tone="warn">
          {state.skippedOps > 0
            ? `${state.skippedOps} AI edit${state.skippedOps === 1 ? "" : "s"} couldn't be applied to your canvas.`
            : "You joined while the AI was editing, so your canvas may be missing some of its edits."}
          <button type="button" onClick={onSync} className="ml-2 font-semibold underline">
            Sync
          </button>
        </Banner>
      )}
    </>
  );
}
