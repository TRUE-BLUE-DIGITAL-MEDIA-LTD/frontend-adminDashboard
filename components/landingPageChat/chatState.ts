import type {
  ChatMessage, ChatModelOption, ChatThread, ChatUsage, JoinState, MessageContent,
  MessageStatus, PresenceUser, QueueState,
} from "./chatTypes";

export interface ChatState {
  status: "connecting" | "ready" | "error";
  error: string | null;
  thread: ChatThread | null;
  messages: ChatMessage[];
  queue: QueueState;
  models: ChatModelOption[];
  limits: { suggestClearTokens: number; blockTokens: number };
  presence: PresenceUser[];
  skippedOps: number;
  joinedMidTurn: boolean;
}

export const initialChatState: ChatState = {
  status: "connecting",
  error: null,
  thread: null,
  messages: [],
  queue: { running: null, queued: [] },
  models: [],
  limits: { suggestClearTokens: 800_000, blockTokens: 950_000 },
  presence: [],
  skippedOps: 0,
  joinedMidTurn: false,
};

export type ChatEvent =
  | { type: "joined"; state: JoinState }
  | { type: "joinFailed"; error: string }
  | { type: "disconnected" }
  | { type: "messageCreated"; message: ChatMessage }
  | { type: "messageDelta"; messageId: string; text: string }
  | { type: "messageUpdated"; messageId: string; status?: MessageStatus; content?: MessageContent; usage?: ChatUsage | null }
  | { type: "queueUpdated"; queue: QueueState }
  | { type: "threadUpdated"; thread: ChatThread }
  | { type: "threadCleared"; threadId: string }
  | { type: "presence"; users: PresenceUser[] }
  | { type: "opSkipped" }
  | { type: "synced" };

function updateMessage(state: ChatState, id: string, fn: (m: ChatMessage) => ChatMessage): ChatState {
  return { ...state, messages: state.messages.map((m) => (m.id === id ? fn(m) : m)) };
}

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case "joined":
      return {
        ...state,
        status: "ready",
        error: null,
        thread: event.state.thread,
        messages: event.state.messages,
        queue: event.state.queue,
        models: event.state.models,
        limits: event.state.limits,
        joinedMidTurn: event.state.queue.running !== null,
      };
    case "joinFailed":
      return { ...state, status: "error", error: event.error };
    case "disconnected":
      // Keep a fatal error (e.g. auth.error, which the server follows with a
      // disconnect) visible instead of showing "Connecting…" forever.
      return state.status === "error" ? state : { ...state, status: "connecting" };
    case "messageCreated":
      return state.messages.some((m) => m.id === event.message.id)
        ? state
        : { ...state, messages: [...state.messages, event.message] };
    case "messageDelta":
      return updateMessage(state, event.messageId, (m) => ({
        ...m,
        content: { ...m.content, text: m.content.text + event.text },
      }));
    case "messageUpdated":
      return updateMessage(state, event.messageId, (m) => ({
        ...m,
        ...(event.status ? { status: event.status } : {}),
        ...(event.content ? { content: event.content } : {}),
        ...(event.usage !== undefined ? { usage: event.usage } : {}),
      }));
    case "queueUpdated":
      return { ...state, queue: event.queue };
    case "threadUpdated":
      return { ...state, thread: event.thread };
    case "threadCleared":
      if (state.thread?.id !== event.threadId) return state;
      return {
        ...state,
        thread: null,
        messages: state.messages.filter((m) => m.threadId === null && m.kind === "team_note"),
        skippedOps: 0,
        joinedMidTurn: false,
      };
    case "presence":
      return { ...state, presence: event.users };
    case "opSkipped":
      return { ...state, skippedOps: state.skippedOps + 1 };
    case "synced":
      return { ...state, skippedOps: 0, joinedMidTurn: false };
  }
}

export function isTurnRunning(state: ChatState): boolean {
  return state.queue.running !== null;
}

export function contextLevel(state: ChatState): "ok" | "suggest" | "blocked" {
  const tokens = state.thread?.lastInputTokens ?? 0;
  if (tokens >= state.limits.blockTokens) return "blocked";
  if (tokens >= state.limits.suggestClearTokens) return "suggest";
  return "ok";
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export function assistantName(modelId: string | undefined, models: ChatModelOption[]): string {
  const provider = models.find((m) => m.id === modelId)?.provider;
  if (provider === "google") return "Gemini";
  if (provider === "anthropic") return "Claude";
  return "AI";
}
