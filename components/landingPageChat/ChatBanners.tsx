import type { ReactNode } from "react";
import type { ChatState } from "./chatState";

function Strip({ children, action, onAction }: { children: ReactNode; action: string; onAction: () => void }) {
  return (
    <div className="flex items-start gap-2 border-b border-line bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
      <span className="flex-1">{children}</span>
      <button type="button" onClick={onAction} className="shrink-0 font-semibold underline underline-offset-2">
        {action}
      </button>
    </div>
  );
}

interface Props {
  state: ChatState;
  level: "ok" | "suggest" | "blocked";
  onClear: () => void;
  onSync: () => void;
}

export default function ChatBanners({ state, level, onClear, onSync }: Props) {
  const needsSync = state.skippedOps > 0 || state.joinedMidTurn;
  return (
    <>
      {level === "suggest" && (
        <Strip action="New conversation" onAction={onClear}>
          This conversation is getting long. Start a new one to keep replies fast and cheap. Your design isn&apos;t affected.
        </Strip>
      )}
      {level === "blocked" && (
        <Strip action="New conversation" onAction={onClear}>
          This conversation is full. Start a new one to send prompts. Team notes still work.
        </Strip>
      )}
      {needsSync && (
        <Strip action="Sync" onAction={onSync}>
          {state.skippedOps > 0
            ? `${state.skippedOps} AI edit${state.skippedOps === 1 ? "" : "s"} couldn't be applied to your canvas.`
            : "You joined while the AI was editing, so your canvas may be missing some changes."}
        </Strip>
      )}
    </>
  );
}
