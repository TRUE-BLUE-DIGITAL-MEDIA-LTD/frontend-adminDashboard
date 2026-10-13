import { useEffect, useRef, useState, type ReactNode } from "react";
import { LuMoreHorizontal, LuPanelRightClose, LuRotateCcw, LuSparkles } from "react-icons/lu";
import { UserAvatar } from "./ChatAvatar";
import type { PresenceUser } from "./chatTypes";

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-panel-raised hover:text-fg [&>svg]:h-4 [&>svg]:w-4"
    >
      {children}
    </button>
  );
}

interface Props {
  presence: PresenceUser[];
  hasThread: boolean;
  clearDisabled: boolean;
  onClear: () => void;
  onCollapse: () => void;
}

export default function ChatHeader({ presence, hasThread, clearDisabled, onClear, onCollapse }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const shown = presence.slice(0, 3);
  const extra = presence.length - shown.length;

  return (
    <div className="flex items-center gap-2 border-b border-line px-3 py-2">
      <LuSparkles className="h-4 w-4 text-blue-500" />
      <h3 className="mr-auto text-sm font-semibold text-fg">AI Design</h3>

      {presence.length > 0 && (
        <div className="flex -space-x-1.5" title={`Here now: ${presence.map((u) => u.name).join(", ")}`}>
          {shown.map((u) => (
            <UserAvatar key={u.userId} name={u.name} image={u.image} small />
          ))}
          {extra > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-panel-raised text-[10px] text-fg-muted ring-2 ring-panel">
              +{extra}
            </span>
          )}
        </div>
      )}

      <div className="relative" ref={menuRef}>
        <IconButton label="More" onClick={() => setMenuOpen((o) => !o)}>
          <LuMoreHorizontal />
        </IconButton>
        {menuOpen && (
          <div role="menu" className="absolute right-0 top-9 z-20 w-56 overflow-hidden rounded-lg border border-line bg-panel py-1 shadow-lg">
            <button
              role="menuitem"
              type="button"
              disabled={clearDisabled || !hasThread}
              onClick={() => {
                setMenuOpen(false);
                onClear();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-fg hover:bg-panel-raised disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LuRotateCcw className="h-4 w-4" /> New conversation
            </button>
            {clearDisabled && <p className="px-3 pb-2 text-xs text-fg-subtle">Stop the current reply first.</p>}
          </div>
        )}
      </div>
      <IconButton label="Collapse chat" onClick={onCollapse}>
        <LuPanelRightClose />
      </IconButton>
    </div>
  );
}
