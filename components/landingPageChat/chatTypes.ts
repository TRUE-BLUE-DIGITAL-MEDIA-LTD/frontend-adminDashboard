import type { DesignOp } from "../../editor/types";

export type MessageKind = "team_note" | "user_prompt" | "assistant" | "system";
export type MessageStatus = "queued" | "running" | "done" | "stopped" | "error";
export type SendKind = "user_prompt" | "team_note";

export interface MobbinCard {
  imageUrl: string;
  appName: string;
  mobbinUrl: string;
}

export interface MessageContent {
  text: string;
  authorName?: string;
  authorImage?: string;
  model?: string;
  edits?: { label: string }[];
  mobbin?: MobbinCard[];
  error?: string;
}

export interface ChatUsage {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  model: string;
}

export interface ChatMessage {
  id: string;
  threadId: string | null;
  kind: MessageKind;
  status: MessageStatus;
  content: MessageContent;
  usage: ChatUsage | null;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  model: string;
  modelLabel: string;
  status: "active" | "cleared";
  createdByName: string;
  lastInputTokens: number;
  mobbinEnabled: boolean;
}

export interface ChatModelOption {
  id: string;
  label: string;
  provider: "anthropic" | "google";
}

export interface PresenceUser {
  userId: string;
  name: string;
  image: string;
}

export interface QueueState {
  running: string | null;
  queued: string[];
}

export interface JoinState {
  thread: ChatThread | null;
  messages: ChatMessage[];
  queue: QueueState;
  models: ChatModelOption[];
  limits: { suggestClearTokens: number; blockTokens: number };
}

export interface DesignOpEvent {
  turnId: string;
  seq: number;
  op: DesignOp;
}

export type Ack<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
