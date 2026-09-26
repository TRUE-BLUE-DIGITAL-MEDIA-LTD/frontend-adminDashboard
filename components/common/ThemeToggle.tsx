import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePref } from "../../utils/theme";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof FiSun }[] = [
  { value: "light", label: "Light", Icon: FiSun },
  { value: "dark", label: "Dark", Icon: FiMoon },
  { value: "system", label: "System", Icon: FiMonitor },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { pref, setPref, mounted } = useTheme();
  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-line bg-panel-raised p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        // Nothing is pressed until mount, so the server markup never disagrees.
        const active = mounted && pref === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setPref(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              active ? "bg-main-color text-white" : "text-fg-muted hover:bg-hover hover:text-fg"
            }`}
          >
            <Icon className="text-sm" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
