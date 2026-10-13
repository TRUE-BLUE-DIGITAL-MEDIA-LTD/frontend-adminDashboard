import { RefObject, useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { OxyEditorRef } from "../../editor/react/OxyEditor";
import { useLandingPageChat } from "../../hooks/useLandingPageChat";
import ChatBanners from "./ChatBanners";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import { assistantName, contextLevel, isTurnRunning } from "./chatState";
import type { Ack, SendKind } from "./chatTypes";

export interface ChatStatus {
  running: boolean;
  assistant: string;
}

interface Props {
  landingPageId: string;
  editorRef: RefObject<OxyEditorRef | null>;
  onCollapse: () => void;
  onStatusChange: (status: ChatStatus) => void;
}

const confirm = async (title: string, text: string, confirmButtonText: string) =>
  (await Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonText })).isConfirmed;

export default function ChatPanel({ landingPageId, editorRef, onCollapse, onStatusChange }: Props) {
  const { state, send, stop, clear, sync } = useLandingPageChat({ landingPageId, editorRef });
  const [model, setModel] = useState("");
  const [kind, setKind] = useState<SendKind>("user_prompt");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState("");

  const selectedModel = model || state.models[0]?.id || "";
  const assistant = assistantName(state.thread?.model ?? selectedModel, state.models);
  const level = contextLevel(state);
  const running = isTurnRunning(state);

  useEffect(() => {
    onStatusChange({ running, assistant });
  }, [running, assistant, onStatusChange]);

  const run = async (action: () => Promise<Ack<unknown>>): Promise<boolean> => {
    setActionError("");
    const ack = await action();
    if (ack.ok === false) setActionError(ack.error);
    return ack.ok;
  };

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    const ok = await run(() => send(kind, value, state.thread ? undefined : selectedModel));
    setSending(false);
    if (ok) setText("");
  };

  const handleClear = async () => {
    if (
      await confirm(
        "Start a new conversation?",
        "Everyone in this chat will see an empty thread and queued prompts are cancelled. The design on the canvas is not affected.",
        "Start new",
      )
    ) {
      await run(clear);
    }
  };

  const handleSync = async () => {
    if (
      await confirm(
        "Replace your canvas?",
        "This loads the AI's latest version of the page and replaces your canvas, including unsaved manual changes.",
        "Sync",
      )
    ) {
      await run(sync);
    }
  };

  const notice = actionError || state.error || (state.status === "connecting" ? "Connecting to the chat…" : "");

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
      <ChatHeader
        presence={state.presence}
        hasThread={!!state.thread}
        clearDisabled={running}
        onClear={handleClear}
        onCollapse={onCollapse}
      />
      <ChatBanners state={state} level={level} onClear={handleClear} onSync={handleSync} />
      <ChatMessageList
        messages={state.messages}
        queue={state.queue}
        assistant={assistant}
        onSuggest={(suggestion) => {
          setKind("user_prompt");
          setText(suggestion);
        }}
      />
      {notice && (
        <p className={`px-3 pt-2 text-xs ${actionError || state.error ? "text-red-500" : "text-fg-subtle"}`}>{notice}</p>
      )}
      <ChatComposer
        text={text}
        onTextChange={setText}
        kind={kind}
        onKindChange={setKind}
        disabled={state.status !== "ready"}
        sending={sending}
        promptBlocked={level === "blocked"}
        running={running}
        assistant={assistant}
        thread={state.thread}
        models={state.models}
        selectedModel={selectedModel}
        onModelChange={setModel}
        limits={state.limits}
        onSubmit={() => void submit()}
        onStop={() => void run(stop)}
      />
    </aside>
  );
}
