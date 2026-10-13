import { useEffect, useRef, type ReactNode } from "react";
import { LuPencil, LuStickyNote } from "react-icons/lu";
import { AiAvatar, UserAvatar } from "./ChatAvatar";
import type { ChatMessage, QueueState } from "./chatTypes";

const SUGGESTIONS = [
  "Make the hero section more eye-catching",
  "Add a pricing section with three tiers",
  "Improve the layout on mobile",
];

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Meta({ name, iso, children }: { name: string; iso: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span className="font-semibold text-fg">{name}</span>
      {/* Locale/timezone formatting differs between server and browser. */}
      <span className="text-fg-subtle" suppressHydrationWarning>
        {timeOf(iso)}
      </span>
      {children}
    </div>
  );
}

function Tag({ tone = "muted", children }: { tone?: "muted" | "red"; children: ReactNode }) {
  const cls = tone === "red" ? "bg-red-500/10 text-red-600 dark:text-red-300" : "bg-panel-raised text-fg-muted";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}

function Skeleton() {
  return (
    <div className="mt-2 space-y-1.5" aria-hidden>
      <div className="h-2.5 w-11/12 animate-pulse rounded bg-panel-raised" />
      <div className="h-2.5 w-3/4 animate-pulse rounded bg-panel-raised" />
    </div>
  );
}

function Working({ edits }: { edits: number }) {
  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        {edits > 0 ? `Editing · ${edits} change${edits === 1 ? "" : "s"}` : "Thinking"}
      </span>
    </div>
  );
}

function AssistantMessage({ message, assistant }: { message: ChatMessage; assistant: string }) {
  const { status, content, createdAt } = message;
  const edits = content.edits ?? [];
  return (
    <div className="flex gap-2.5">
      <AiAvatar />
      <div className="min-w-0 flex-1">
        <Meta name={assistant} iso={createdAt}>
          {status === "stopped" && <Tag>Stopped</Tag>}
          {status === "error" && <Tag tone="red">Failed</Tag>}
        </Meta>
        {content.text ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">{content.text}</p>
        ) : (
          status === "running" && <Skeleton />
        )}
        {edits.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {edits.map((edit, i) => (
              <li key={i} className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-panel-raised px-2 py-0.5 text-xs text-fg-muted">
                <LuPencil className="h-3 w-3 shrink-0" />
                <span className="truncate">{edit.label}</span>
              </li>
            ))}
          </ul>
        )}
        {content.mobbin && content.mobbin.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-[11px] font-medium text-fg-subtle">References from Mobbin</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {content.mobbin.map((card) => (
                <a key={card.imageUrl} href={card.mobbinUrl} target="_blank" rel="noreferrer" className="w-24 shrink-0">
                  <img src={card.imageUrl} alt={card.appName} className="h-32 w-24 rounded-md border border-line object-cover object-top" />
                  <span className="mt-0.5 block truncate text-[11px] text-fg-muted">{card.appName}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {status === "running" && <Working edits={edits.length} />}
        {content.error && (
          <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-300">{content.error}</p>
        )}
      </div>
    </div>
  );
}

function PersonMessage({ message, queuePosition }: { message: ChatMessage; queuePosition: number }) {
  const { kind, status, content, createdAt } = message;
  const isNote = kind === "team_note";
  return (
    <div className="flex gap-2.5">
      <UserAvatar name={content.authorName} image={content.authorImage} />
      <div className="min-w-0 flex-1">
        <Meta name={content.authorName ?? "Teammate"} iso={createdAt}>
          {isNote && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
              <LuStickyNote className="h-3 w-3" /> Team note
            </span>
          )}
          {status === "queued" && <Tag>{queuePosition >= 0 ? `Queued · #${queuePosition + 1}` : "Queued"}</Tag>}
          {status === "stopped" && !isNote && <Tag>Cancelled</Tag>}
        </Meta>
        {isNote ? (
          <p className="mt-1 whitespace-pre-wrap break-words border-l-2 border-amber-400 pl-2.5 text-sm text-fg-muted">{content.text}</p>
        ) : (
          <p className="mt-1 inline-block max-w-full whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-blue-500/10 px-3 py-2 text-sm text-fg">
            {content.text}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  messages: ChatMessage[];
  queue: QueueState;
  assistant: string;
  onSuggest: (text: string) => void;
}

export default function ChatMessageList({ messages, queue, assistant, onSuggest }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, last?.content.text.length, last?.content.edits?.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <AiAvatar large />
        <div>
          <p className="text-sm font-semibold text-fg">Design this page with {assistant}</p>
          <p className="mt-1 text-xs text-fg-muted">Everyone who opens this page sees the same conversation and the same changes.</p>
        </div>
        <div className="flex w-full flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggest(s)}
              className="rounded-lg border border-line px-3 py-2 text-left text-xs text-fg-muted hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-fg"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {messages.map((m) =>
        m.kind === "system" ? (
          <p key={m.id} className="text-center text-[11px] text-fg-subtle">
            {m.content.text}
          </p>
        ) : m.kind === "assistant" ? (
          <AssistantMessage key={m.id} message={m} assistant={assistant} />
        ) : (
          <PersonMessage key={m.id} message={m} queuePosition={queue.queued.indexOf(m.id)} />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
