import { useEffect, useRef } from "react";
import type { ChatMessage, QueueState } from "./chatTypes";

function ChatMessageItem({ message, queuePosition, assistant }: { message: ChatMessage; queuePosition: number; assistant: string }) {
  const { kind, status, content } = message;
  if (kind === "system") {
    return <p className="text-center text-xs text-fg-subtle">{content.text}</p>;
  }
  const isAssistant = kind === "assistant";
  const tone = isAssistant ? "bg-panel-raised" : kind === "team_note" ? "border border-dashed border-line" : "bg-blue-500/10";

  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${tone}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
        <span className="font-semibold text-fg">{isAssistant ? `✨ ${assistant}` : content.authorName ?? "Teammate"}</span>
        {kind === "team_note" && <span>💬 team note</span>}
        {status === "queued" && <span>queued{queuePosition >= 0 ? ` · #${queuePosition + 1}` : ""}</span>}
        {status === "running" && <span className="animate-pulse">working…</span>}
        {status === "stopped" && <span>stopped</span>}
        {status === "error" && <span className="text-red-500">failed</span>}
      </div>
      {content.text && <p className="whitespace-pre-wrap text-fg">{content.text}</p>}
      {content.edits && content.edits.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {content.edits.map((edit, i) => (
            <li key={i} className="rounded-full border border-line px-2 py-0.5 text-xs text-fg-muted">
              ✎ {edit.label}
            </li>
          ))}
        </ul>
      )}
      {content.mobbin && content.mobbin.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {content.mobbin.map((card) => (
            <a key={card.imageUrl} href={card.mobbinUrl} target="_blank" rel="noreferrer" className="w-28 shrink-0">
              <img src={card.imageUrl} alt={card.appName} className="h-40 w-28 rounded-md border border-line object-cover object-top" />
              <span className="block truncate text-xs text-fg-muted">{card.appName}</span>
            </a>
          ))}
        </div>
      )}
      {content.error && <p className="mt-1 text-xs text-red-500">{content.error}</p>}
    </div>
  );
}

export default function ChatMessageList({ messages, queue, assistant }: { messages: ChatMessage[]; queue: QueueState; assistant: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, last?.content.text.length]);

  if (messages.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-fg-muted">
        Describe a change to the page, or leave a note for your team. Everyone who opens this page sees the same conversation.
      </p>
    );
  }
  return (
    <div className="max-h-[28rem] space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((m) => (
        <ChatMessageItem key={m.id} message={m} queuePosition={queue.queued.indexOf(m.id)} assistant={assistant} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
