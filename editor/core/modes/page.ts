export const pageModeConfig = {
  name: "page" as const,
  defaultCanvasWidth: 1024,
  responsiveBreakpoints: [
    { name: "desktop", widthMedia: undefined },
    { name: "tablet", widthMedia: "768px" },
    { name: "mobile", widthMedia: "480px" },
  ],
};
