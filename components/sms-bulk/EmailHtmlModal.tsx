import { useEffect, useMemo } from "react";
import { sanitizeEmailHtml } from "../../utils/sanitizeEmailHtml";

type Props = {
  html: string;
  onClose: () => void;
};

// Same hand-rolled modal pattern as pages/inbox/index.tsx: Esc closes,
// click outside closes, page behind must not scroll.
function EmailHtmlModal({ html, onClose }: Props) {
  const sanitized = useMemo(() => sanitizeEmailHtml(html), [html]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 text-xl leading-none text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="mb-4 text-lg font-bold">Email</h2>
        <div
          className="rounded-lg border bg-white p-4 text-sm"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    </div>
  );
}

export default EmailHtmlModal;
