import DOMPurify from "dompurify";

// Email HTML is third-party content rendered directly in the page DOM
// (no iframe), so it must be sanitized; every link is forced to open in
// a new window. Client-side only — callers must not run this during SSR.
export function sanitizeEmailHtml(html: string): string {
  const clean = DOMPurify.sanitize(html);
  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.querySelectorAll("a").forEach((anchor) => {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });
  return doc.body.innerHTML;
}
