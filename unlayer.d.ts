import { Unlayer } from "react-email-editor";

declare global {
  const unlayer: Unlayer;
  interface Window {
    __unlayer_lastEditorId: number;
  }
}
