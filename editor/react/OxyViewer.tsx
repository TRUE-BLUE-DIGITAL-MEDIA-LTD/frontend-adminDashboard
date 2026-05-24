import { useMemo } from "react";

export interface OxyViewerProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export function OxyViewer({ html, className, style }: OxyViewerProps) {
  const safeHtml = useMemo(() => ({ __html: html }), [html]);
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={safeHtml}
    />
  );
}
