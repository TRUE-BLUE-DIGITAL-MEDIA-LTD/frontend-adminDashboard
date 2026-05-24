import { Unlayer } from "react-email-editor";

declare global {
  const unlayer: UnlayerType;
  interface Window {
    __unlayer_lastEditorId: number;
    unlayer: Unlayer; // Assuming 'unlayer' is attached to the window
  }
}
