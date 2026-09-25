import { createTheme, type Theme } from "@mui/material/styles";
import { THEME_HEX, type ResolvedTheme } from "./theme";

/** MUI theme whose palette follows the dashboard theme tokens. */
export function buildMuiTheme(resolved: ResolvedTheme): Theme {
  const c = THEME_HEX[resolved];
  return createTheme({
    palette: {
      mode: resolved,
      primary: { main: "#00ABE4" },
      background: { default: c.surface, paper: c.panel },
      text: { primary: c.fg, secondary: c["fg-muted"], disabled: c["fg-subtle"] },
      divider: resolved === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    typography: { fontFamily: "inherit" },
  });
}
