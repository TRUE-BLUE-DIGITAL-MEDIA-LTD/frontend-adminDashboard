import { useEffect, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  maxWidthClassName?: string;
  zIndexClassName?: string;
  /** When true (default if title/footer provided), wrap children in modern card shell */
  shell?: boolean;
};

function PopupLayout({
  children,
  onClose,
  title,
  subtitle,
  footer,
  maxWidthClassName = "max-w-lg",
  zIndexClassName = "z-50",
  shell,
}: LayoutProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "initial";
    };
  }, []);

  const close = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  const useShell = shell ?? Boolean(title || footer);

  return (
    <section className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center p-4`}>
      {useShell ? (
        <div
          className={`relative z-10 flex max-h-[90vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl`}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-6 py-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-fg">
                {title ?? ""}
              </h2>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-fg-muted transition hover:bg-hover hover:text-fg"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>
          {footer ? (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative z-10">{children}</div>
      )}
      <div onClick={close} className="fixed inset-0 -z-10 bg-scrim" />
    </section>
  );
}

export default PopupLayout;
