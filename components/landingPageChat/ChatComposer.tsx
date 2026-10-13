import { useState } from "react";
import type { SendKind } from "./chatTypes";

interface Props {
  disabled: boolean;
  promptBlocked: boolean;
  running: boolean;
  assistant: string;
  onSend: (kind: SendKind, text: string) => Promise<boolean>;
  onStop: () => void;
}

export default function ChatComposer({ disabled, promptBlocked, running, assistant, onSend, onStop }: Props) {
  const [kind, setKind] = useState<SendKind>("user_prompt");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const blocked = kind === "user_prompt" && promptBlocked;

  const submit = async () => {
    const value = text.trim();
    if (!value || sending || disabled || blocked) return;
    setSending(true);
    const ok = await onSend(kind, value);
    setSending(false);
    if (ok) setText("");
  };

  const placeholder = blocked
    ? "This conversation is full. Clear it to send prompts."
    : kind === "user_prompt"
      ? "e.g. Make the hero darker and add a pricing section with three tiers"
      : `Leave a note for your team (${assistant} reads it on the next prompt)`;

  return (
    <div className="border-t border-line p-3">
      <div className="mb-2 flex gap-1 text-xs">
        {(["user_prompt", "team_note"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full px-3 py-1 ${kind === k ? "bg-blue-600 text-white" : "border border-line text-fg-muted"}`}
          >
            {k === "user_prompt" ? `✨ Ask ${assistant}` : "💬 Team note"}
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        maxLength={8000}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
        className="w-full resize-none rounded-lg border border-line bg-panel p-3 text-fg placeholder:text-fg-subtle focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2 flex justify-end gap-2">
        {running && (
          <button type="button" onClick={onStop} className="rounded-full border border-line px-4 py-1.5 text-sm text-fg hover:bg-panel-raised">
            ■ Stop
          </button>
        )}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || sending || blocked || !text.trim()}
          className="rounded-full bg-blue-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
