export interface TawkInterface {
  maximize: () => any;
  minimize: () => any;
  toggle: () => any;
  popup: () => any;
  showWidget: () => any;
  hideWidget: () => any;
  toggleVisibility: () => any;
  endChat: () => any;
  getWindowType: () => any;
  getStatus: () => any;
  isChatMaximized: () => any;
  isChatMinimized: () => any;
  isChatHidden: () => any;
  isChatOngoing: () => any;
  isVisitorEngaged: () => any;
  onLoaded: () => any;
  onBeforeLoaded: () => any;
  widgetPosition: () => any;
  visitor: (data: any) => any;
  setAttributes: (attribute: any, callback?: any) => any;
  addEvent: (event: any, metadata: any, callback: any) => any;
  addTags: (tags: any, callback: any) => any;
  removeTags: (tags: any, callback: any) => any;
}
