import { Unlayer } from "react-email-editor";

declare global {
  const unlayer: Unlayer;
  interface Window {
    __unlayer_lastEditorId: number;
    unlayer: UnlayerType; // Assuming 'unlayer' is attached to the window
  }
}

interface UnlayerType {
  registerPropertyEditor(data: any): void; // Correct definition!
  createWidget(config: any): any; // Add other definitions as needed
  registerTool(config: any): void;
  createViewer(config: any): any;
}
