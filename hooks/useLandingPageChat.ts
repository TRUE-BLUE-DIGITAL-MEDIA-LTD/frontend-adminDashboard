import { parseCookies } from "nookies";
import { RefObject, useCallback, useEffect, useReducer, useRef } from "react";
import type { Socket } from "socket.io-client";
import { chatReducer, initialChatState } from "../components/landingPageChat/chatState";
import type {
  Ack, ChatMessage, ChatThread, ChatUsage, DesignOpEvent, JoinState, MessageContent,
  MessageStatus, PresenceUser, QueueState, SendKind,
} from "../components/landingPageChat/chatTypes";
import type { OxyEditorRef } from "../editor/react/OxyEditor";
import { createLpChatSocket } from "../services/landingPageChat/socket";

const ACK_TIMEOUT_MS = 10_000;

export function useLandingPageChat({
  landingPageId,
  editorRef,
}: {
  landingPageId: string;
  editorRef: RefObject<OxyEditorRef | null>;
}) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = parseCookies().access_token;
    const socket = createLpChatSocket(process.env.NEXT_PUBLIC_SERVER_URL as string, token);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.timeout(ACK_TIMEOUT_MS).emit("join", { landingPageId }, (err: Error | null, ack: Ack<JoinState>) => {
        if (err) dispatch({ type: "joinFailed", error: "The chat server did not respond." });
        else if (ack.ok && ack.data) dispatch({ type: "joined", state: ack.data });
        else dispatch({ type: "joinFailed", error: ack.ok ? "Could not join the chat." : ack.error });
      });
    });
    socket.on("disconnect", () => dispatch({ type: "disconnected" }));
    // The server rejects bad tokens in the handshake. socket.io doesn't retry
    // those, so surface it; other connect errors (network) retry on their own.
    socket.on("connect_error", (err: Error) => {
      if (err.message === "Unauthorized") {
        dispatch({ type: "joinFailed", error: "Your session expired. Reload the page." });
      }
    });
    socket.on("message.created", (message: ChatMessage) => dispatch({ type: "messageCreated", message }));
    socket.on("message.delta", (p: { messageId: string; text: string }) => dispatch({ type: "messageDelta", ...p }));
    socket.on("message.updated", (p: { messageId: string; status?: MessageStatus; content?: MessageContent; usage?: ChatUsage | null }) =>
      dispatch({ type: "messageUpdated", ...p }),
    );
    socket.on("queue.update", (queue: QueueState) => dispatch({ type: "queueUpdated", queue }));
    socket.on("thread.updated", (thread: ChatThread) => dispatch({ type: "threadUpdated", thread }));
    socket.on("thread.cleared", (p: { threadId: string }) => dispatch({ type: "threadCleared", threadId: p.threadId }));
    socket.on("presence", (users: PresenceUser[]) => dispatch({ type: "presence", users }));
    socket.on("design.op", (event: DesignOpEvent) => {
      const editor = editorRef.current?.editor;
      const result = editor ? editor.applyDesignOp(event.op) : { status: "skipped" as const, reason: "Editor not ready" };
      if (result.status === "skipped") dispatch({ type: "opSkipped" });
    });
    socket.on("snapshot.request", (_payload: unknown, ack: (snapshot: { html: string; css: string } | null) => void) => {
      const editor = editorRef.current?.editor;
      ack(editor ? editor.getSnapshot() : null);
    });

    socket.connect();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [landingPageId, editorRef]);

  const emitAck = useCallback(<T = undefined,>(event: string, payload: unknown) => {
    return new Promise<Ack<T>>((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        resolve({ ok: false, error: "Not connected to the chat. Reconnecting…" });
        return;
      }
      socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, (err: Error | null, ack: Ack<T>) => {
        resolve(err ? { ok: false, error: "The chat server did not respond." } : ack);
      });
    });
  }, []);

  const send = useCallback(
    (kind: SendKind, text: string, model?: string) => emitAck("message", { landingPageId, kind, text, model }),
    [emitAck, landingPageId],
  );
  const stop = useCallback(() => emitAck("stop", { landingPageId }), [emitAck, landingPageId]);
  const clear = useCallback(() => emitAck("clear", { landingPageId }), [emitAck, landingPageId]);
  const sync = useCallback(async () => {
    const ack = await emitAck<{ html: string; css: string }>("sync", { landingPageId });
    if (ack.ok && ack.data) {
      editorRef.current?.editor?.applyDesignOp({ kind: "full", html: ack.data.html, css: ack.data.css });
      dispatch({ type: "synced" });
    }
    return ack;
  }, [emitAck, landingPageId, editorRef]);

  return { state, send, stop, clear, sync };
}
