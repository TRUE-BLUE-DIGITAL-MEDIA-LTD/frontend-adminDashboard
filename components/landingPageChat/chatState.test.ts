import { describe, expect, it } from "vitest";
import { assistantName, chatReducer, contextLevel, formatTokens, initialChatState, isTurnRunning } from "./chatState";
import type { ChatMessage, JoinState } from "./chatTypes";

const msg = (id: string, over: Partial<ChatMessage> = {}): ChatMessage => ({
  id, threadId: "t1", kind: "assistant", status: "running", content: { text: "" }, usage: null, createdAt: "2026-10-13T00:00:00Z", ...over,
});

const join = (over: Partial<JoinState> = {}): JoinState => ({
  thread: { id: "t1", model: "claude-opus-5-5", modelLabel: "Claude Opus 5.5", status: "active", createdByName: "Ann", lastInputTokens: 0, mobbinEnabled: false },
  messages: [msg("a")],
  queue: { running: null, queued: [] },
  models: [
    { id: "claude-opus-5-5", label: "Claude Opus 5.5", provider: "anthropic" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", provider: "google" },
  ],
  limits: { suggestClearTokens: 800_000, blockTokens: 950_000 },
  ...over,
});

describe("chatReducer", () => {
  it("loads join state and flags a mid-turn join", () => {
    const s = chatReducer(initialChatState, { type: "joined", state: join({ queue: { running: "m1", queued: [] } }) });
    expect(s.status).toBe("ready");
    expect(s.messages).toHaveLength(1);
    expect(s.joinedMidTurn).toBe(true);
    expect(isTurnRunning(s)).toBe(true);
  });

  it("appends created messages once and streams deltas into them", () => {
    let s = chatReducer(initialChatState, { type: "joined", state: join({ messages: [] }) });
    s = chatReducer(s, { type: "messageCreated", message: msg("a") });
    s = chatReducer(s, { type: "messageCreated", message: msg("a") });
    s = chatReducer(s, { type: "messageDelta", messageId: "a", text: "Hel" });
    s = chatReducer(s, { type: "messageDelta", messageId: "a", text: "lo" });
    expect(s.messages).toHaveLength(1);
    expect(s.messages[0].content.text).toBe("Hello");
  });

  it("merges message updates without dropping streamed text when content is absent", () => {
    let s = chatReducer(initialChatState, { type: "joined", state: join() });
    s = chatReducer(s, { type: "messageDelta", messageId: "a", text: "x" });
    s = chatReducer(s, { type: "messageUpdated", messageId: "a", status: "done" });
    expect(s.messages[0]).toMatchObject({ status: "done", content: { text: "x" } });
    s = chatReducer(s, { type: "messageUpdated", messageId: "a", content: { text: "final", edits: [{ label: "Replaced #hero" }] } });
    expect(s.messages[0].content.edits).toEqual([{ label: "Replaced #hero" }]);
  });

  it("clears the thread for everyone and resets sync flags", () => {
    let s = chatReducer(initialChatState, { type: "joined", state: join({ queue: { running: "m1", queued: [] } }) });
    s = chatReducer(s, { type: "opSkipped" });
    s = chatReducer(s, { type: "threadCleared", threadId: "t1" });
    expect(s.thread).toBeNull();
    expect(s.messages).toEqual([]);
    expect(s.skippedOps).toBe(0);
    expect(s.joinedMidTurn).toBe(false);
  });

  it("ignores clears for other threads and counts skipped ops until synced", () => {
    let s = chatReducer(initialChatState, { type: "joined", state: join() });
    expect(chatReducer(s, { type: "threadCleared", threadId: "other" })).toBe(s);
    s = chatReducer(chatReducer(s, { type: "opSkipped" }), { type: "opSkipped" });
    expect(s.skippedOps).toBe(2);
    expect(chatReducer(s, { type: "synced" }).skippedOps).toBe(0);
  });

  it("tracks queue, presence, disconnects and join failures", () => {
    let s = chatReducer(initialChatState, { type: "joined", state: join() });
    s = chatReducer(s, { type: "queueUpdated", queue: { running: "m2", queued: ["m3"] } });
    s = chatReducer(s, { type: "presence", users: [{ userId: "u1", name: "Ann", image: "" }] });
    expect(s.queue.queued).toEqual(["m3"]);
    expect(s.presence).toHaveLength(1);
    expect(chatReducer(s, { type: "disconnected" }).status).toBe("connecting");
    expect(chatReducer(s, { type: "joinFailed", error: "nope" })).toMatchObject({ status: "error", error: "nope" });
    const failed = chatReducer(s, { type: "joinFailed", error: "nope" });
    expect(chatReducer(failed, { type: "disconnected" })).toMatchObject({ status: "error", error: "nope" });
  });
});

describe("helpers", () => {
  it("contextLevel follows the thresholds", () => {
    const at = (n: number) => chatReducer(initialChatState, { type: "joined", state: join({ thread: { ...join().thread!, lastInputTokens: n } }) });
    expect(contextLevel(at(799_999))).toBe("ok");
    expect(contextLevel(at(800_000))).toBe("suggest");
    expect(contextLevel(at(950_000))).toBe("blocked");
    expect(contextLevel(initialChatState)).toBe("ok");
  });

  it("formatTokens and assistantName", () => {
    expect(formatTokens(950)).toBe("950");
    expect(formatTokens(312_400)).toBe("312K");
    expect(formatTokens(1_000_000)).toBe("1.0M");
    const models = join().models;
    expect(assistantName("gemini-3.1-pro-preview", models)).toBe("Gemini");
    expect(assistantName("claude-opus-5-5", models)).toBe("Claude");
    expect(assistantName(undefined, models)).toBe("AI");
  });
});
