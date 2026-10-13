import { formatTokens, type ChatState } from "./chatState";

interface Props {
  state: ChatState;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onClear: () => void;
  clearDisabled: boolean;
}

export default function ChatHeader({ state, selectedModel, onModelChange, onClear, clearDisabled }: Props) {
  const tokens = state.thread?.lastInputTokens ?? 0;
  const pct = Math.min(100, Math.round((tokens / 1_000_000) * 100));
  const warn = tokens >= state.limits.suggestClearTokens;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
      <h3 className="mr-auto text-lg font-bold text-fg">✨ AI Design Chat</h3>

      {state.thread ? (
        <span className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted">
          {state.thread.modelLabel} · started by {state.thread.createdByName}
        </span>
      ) : (
        <label className="flex items-center gap-2 text-xs text-fg-muted">
          Start with
          <select
            className="rounded-md border border-line bg-panel px-2 py-1 text-fg"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {state.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-2 text-xs text-fg-muted" title="Conversation size (prompt tokens)">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-panel-raised">
          <div className={`h-full ${warn ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
        </div>
        {formatTokens(tokens)} / 1M
      </div>

      <div className="flex -space-x-2">
        {state.presence.slice(0, 5).map((u) =>
          u.image ? (
            <img key={u.userId} src={u.image} alt={u.name} title={u.name} className="h-7 w-7 rounded-full border-2 border-line object-cover" />
          ) : (
            <span key={u.userId} title={u.name} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-panel-raised text-xs text-fg">
              {u.name.slice(0, 1).toUpperCase()}
            </span>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={clearDisabled || !state.thread}
        className="rounded-md border border-line px-3 py-1 text-xs text-fg hover:bg-panel-raised disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  );
}
