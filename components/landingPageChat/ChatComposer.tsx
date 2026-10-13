import { LuArrowUp, LuSparkles, LuSquare, LuStickyNote } from "react-icons/lu";
import { formatTokens } from "./chatState";
import type { ChatModelOption, ChatThread, SendKind } from "./chatTypes";

function ContextRing({ tokens, suggestAt, blockAt }: { tokens: number; suggestAt: number; blockAt: number }) {
  const r = 7;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, tokens / 1_000_000);
  const tone = tokens >= blockAt ? "stroke-red-500" : tokens >= suggestAt ? "stroke-amber-500" : "stroke-blue-500";
  return (
    <span
      className="flex h-8 w-7 items-center justify-center"
      title={`Conversation size: ${formatTokens(tokens)} of 1M tokens`}
      aria-label={`Conversation size: ${formatTokens(tokens)} of 1M tokens`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90">
        <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" className="stroke-line" />
        <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" className={tone} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} />
      </svg>
    </span>
  );
}

interface Props {
  text: string;
  onTextChange: (text: string) => void;
  kind: SendKind;
  onKindChange: (kind: SendKind) => void;
  disabled: boolean;
  sending: boolean;
  promptBlocked: boolean;
  running: boolean;
  assistant: string;
  thread: ChatThread | null;
  models: ChatModelOption[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  limits: { suggestClearTokens: number; blockTokens: number };
  onSubmit: () => void;
  onStop: () => void;
}

export default function ChatComposer(props: Props) {
  const { text, kind, disabled, sending, promptBlocked, running, assistant, thread, models, limits } = props;
  const blocked = kind === "user_prompt" && promptBlocked;
  const showStop = running && !text.trim();
  const canSend = !disabled && !sending && !blocked && !!text.trim();

  const placeholder = blocked
    ? "This conversation is full. Start a new one to send prompts."
    : kind === "user_prompt"
      ? `Ask ${assistant} to change the page…`
      : `Note for your team. ${assistant} reads it with the next prompt.`;

  const kinds: { id: SendKind; label: string; icon: JSX.Element }[] = [
    { id: "user_prompt", label: `Ask ${assistant}`, icon: <LuSparkles className="h-3 w-3" /> },
    { id: "team_note", label: "Note", icon: <LuStickyNote className="h-3 w-3" /> },
  ];

  return (
    <div className="border-t border-line p-3">
      <div className="rounded-2xl border border-line bg-panel shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <textarea
          rows={3}
          maxLength={8000}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => props.onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) props.onSubmit();
            }
          }}
          className="block w-full resize-none rounded-t-2xl bg-transparent px-3 pt-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <div className="flex rounded-lg bg-panel-raised p-0.5">
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => props.onKindChange(k.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs ${kind === k.id ? "bg-panel font-medium text-fg shadow-sm" : "text-fg-muted hover:text-fg"}`}
              >
                {k.icon}
                {k.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            <ContextRing tokens={thread?.lastInputTokens ?? 0} suggestAt={limits.suggestClearTokens} blockAt={limits.blockTokens} />
            {thread ? (
              <span className="max-w-[9rem] truncate rounded-md px-1.5 py-1 text-xs text-fg-muted" title={`Started by ${thread.createdByName}`}>
                {thread.modelLabel}
              </span>
            ) : (
              <select
                aria-label="Model for this conversation"
                value={props.selectedModel}
                onChange={(e) => props.onModelChange(e.target.value)}
                className="max-w-[9rem] cursor-pointer rounded-md bg-transparent px-1 py-1 text-xs text-fg-muted hover:bg-panel-raised focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
            {showStop ? (
              <button
                type="button"
                aria-label="Stop"
                title="Stop"
                onClick={props.onStop}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-line text-fg hover:bg-panel-raised"
              >
                <LuSquare className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Send"
                title="Send"
                onClick={props.onSubmit}
                disabled={!canSend}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LuArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-fg-subtle">
        {running ? `${assistant} is working. New prompts wait in the queue.` : "Enter to send · Shift+Enter for a new line"}
      </p>
    </div>
  );
}
