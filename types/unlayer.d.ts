import { Unlayer } from "react-email-editor";

declare global {
  const unlayer: UnlayerType;
  interface Window {
    __unlayer_lastEditorId: number;
    unlayer: Unlayer; // Assuming 'unlayer' is attached to the window
  }
}

// interface UnlayerType {
//   registerPropertyEditor(data: any): void; // Correct definition!
//   createWidget(config: any): any; // Add other definitions as needed
//   registerTool(config: any): void;
//   createViewer(config: any): void;
//   createWidget(data: {
//     /**
//      * This is the HTML of your widget. It is passed the following arguments:
//      *
//      * @param value - The current value of this property.
//      * @param updateValue - The function to update the value of this property.
//      *                      The first argument has to be the new value, and the
//      *                      second argument is optional data that can be used in
//      *                      the transformer to update values for other properties.
//      * @param data - Optional data passed by your application.
//      * @returns The HTML string of the widget.
//      */
//     render(value: any, updateValue: (value: any) => void, data: any): string;
//     /**
//      * This gets called when your widget is mounted. You can attach events to the
//      * HTML elements here. It is passed the following arguments:
//      *
//      * @param node - The DOM ref to the HTML element that you created in the render
//      *               method.
//      * @param value - The current value of this property.
//      * @param updateValue - The function to update the value of this property.
//      *                      The first argument has to be the new value, and the
//      *                      second argument is optional data that can be used in
//      *                      the transformer to update values for other properties.
//      * @param data - Optional data passed by your application.
//      */
//     mount(
//       node: HTMLElement,
//       value: any,
//       updateValue: (value: any) => void,
//       data: any,
//     ): void;
//   }): void;
// }
