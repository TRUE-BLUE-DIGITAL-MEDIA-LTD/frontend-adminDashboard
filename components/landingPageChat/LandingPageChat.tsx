import { RefObject, useState } from "react";
import Swal from "sweetalert2";
import type { OxyEditorRef } from "../../editor/react/OxyEditor";
import { useLandingPageChat } from "../../hooks/useLandingPageChat";
import ChatBanners from "./ChatBanners";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import { assistantName, contextLevel, isTurnRunning } from "./chatState";
import type { Ack } from "./chatTypes";

interface Props {
  landingPageId: string;
  editorRef: RefObject<OxyEditorRef | null>;
}

export default function LandingPageChat({ landingPageId, editorRef }: Props) {
  const { state, send, stop, clear, sync } = useLandingPageChat({ landingPageId, editorRef });
  const [model, setModel] = useState("");
  const [actionError, setActionError] = useState("");

  const selectedModel = model || state.models[0]?.id || "";
  const assistant = assistantName(state.thread?.model ?? selectedModel, state.models);
  const level = contextLevel(state);
  const running = isTurnRunning(state);

  const run = async (action: () => Promise<Ack<unknown>>): Promise<boolean> => {
    setActionError("");
    const ack = await action();
    if (ack.ok === false) setActionError(ack.error);
    return ack.ok;
  };

  const confirm = async (title: string, text: string, confirmButtonText: string) =>
    (await Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonText })).isConfirmed;

  const handleClear = async () => {
    if (await confirm(
      "Clear this conversation?",
      "Everyone in this chat will see an empty thread and queued prompts are cancelled. The design on the canvas is not affected.",
      "Clear",
    )) await run(clear);
  };

  const handleSync = async () => {
    if (await confirm(
      "Replace your canvas?",
      "This loads the AI's latest version of the page and replaces your canvas, including unsaved manual changes.",
      "Sync",
    )) await run(sync);
  };

  return (
    <div className="mx-auto mt-5 flex w-11/12 flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
      <ChatHeader
        state={state}
        selectedModel={selectedModel}
        onModelChange={setModel}
        onClear={handleClear}
        clearDisabled={running}
      />
      <ChatBanners state={state} level={level} running={running} assistant={assistant} onClear={handleClear} onSync={handleSync} />
      <ChatMessageList messages={state.messages} queue={state.queue} assistant={assistant} />
      {(actionError || state.error) && <p className="px-4 pb-2 text-sm text-red-500">{actionError || state.error}</p>}
      {state.status === "connecting" && <p className="px-4 pb-2 text-xs text-fg-subtle">Connecting to the chat…</p>}
      <ChatComposer
        disabled={state.status !== "ready"}
        promptBlocked={level === "blocked"}
        running={running}
        assistant={assistant}
        onStop={() => void run(stop)}
        onSend={(kind, text) => run(() => send(kind, text, state.thread ? undefined : selectedModel))}
      />
    </div>
  );
}
