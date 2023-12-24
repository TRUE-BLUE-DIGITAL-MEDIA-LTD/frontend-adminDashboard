export interface UnlayerMethods {
  loadDesign: (json: JSON) => any;
  saveDesign: () => any;
  exportHtml: (callback: (data: { design: any; html: string }) => void) => void;
}
