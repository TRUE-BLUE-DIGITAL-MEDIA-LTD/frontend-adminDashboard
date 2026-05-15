export interface UnlayerDesign {
  counters?: Record<string, number>;
  body: UnlayerBody;
  schemaVersion?: number;
}

export interface UnlayerBody {
  id?: string;
  rows: UnlayerRow[];
  values: UnlayerBodyValues;
  headers?: UnlayerRow[];
  footers?: UnlayerRow[];
}

export interface UnlayerBodyValues {
  backgroundColor?: string;
  backgroundImage?: UnlayerBackgroundImage;
  contentWidth?: string;
  contentAlign?: "left" | "center" | "right";
  fontFamily?: { label: string; value: string };
  textColor?: string;
  linkStyle?: UnlayerLinkStyle;
  popupPosition?: string;
  popupWidth?: string;
  popupHeight?: string;
  popupBackgroundColor?: string;
  popupBackgroundImage?: UnlayerBackgroundImage;
  popupCloseButton_position?: string;
  popupCloseButton_backgroundColor?: string;
  popupCloseButton_iconColor?: string;
  popupCloseButton_borderRadius?: string;
  popupCloseButton_margin?: string;
  popupCloseButton_action?: { name: string; attrs?: Record<string, string> };
  popupOverlay_backgroundColor?: string;
  language?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UnlayerRow {
  id?: string;
  cells: number[];
  columns: UnlayerColumn[];
  values: UnlayerRowValues;
}

export interface UnlayerRowValues {
  backgroundColor?: string;
  columnsBackgroundColor?: string;
  backgroundImage?: UnlayerBackgroundImage;
  padding?: string;
  anchor?: string;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  noStackMobile?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UnlayerColumn {
  id?: string;
  contents: UnlayerContent[];
  values: UnlayerColumnValues;
}

export interface UnlayerColumnValues {
  backgroundColor?: string;
  padding?: string;
  border?: UnlayerBorder;
  borderRadius?: string;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export type UnlayerContentType =
  | "text"
  | "image"
  | "button"
  | "divider"
  | "html"
  | "heading"
  | "menu"
  | "social"
  | "timer"
  | "video"
  | "form"
  | (string & {});

export interface UnlayerContent {
  id?: string;
  type: UnlayerContentType;
  values: UnlayerContentValues;
  slug?: string;
}

export interface UnlayerContentValues {
  containerPadding?: string;
  anchor?: string;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UnlayerBackgroundImage {
  url: string;
  fullWidth?: boolean;
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  size?: "cover" | "contain" | "auto" | string;
  position?: string;
}

export interface UnlayerLinkStyle {
  body?: boolean;
  inherit?: boolean;
  linkColor?: string;
  linkHoverColor?: string;
  linkUnderline?: boolean;
  linkHoverUnderline?: boolean;
}

export interface UnlayerBorder {
  borderTopColor?: string;
  borderTopStyle?: string;
  borderTopWidth?: string;
  borderRightColor?: string;
  borderRightStyle?: string;
  borderRightWidth?: string;
  borderBottomColor?: string;
  borderBottomStyle?: string;
  borderBottomWidth?: string;
  borderLeftColor?: string;
  borderLeftStyle?: string;
  borderLeftWidth?: string;
}
