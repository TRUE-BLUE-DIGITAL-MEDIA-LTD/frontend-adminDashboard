import "../styles/globals.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "grapesjs/dist/css/grapes.min.css";
import "@/editor/styles/editor-ui.css";
import type { AppProps } from "next/app";
import { PagesProgressBar as ProgressBar } from "next-nprogress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { buildMuiTheme } from "../utils/muiTheme";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60, // 1 hour in ms
            refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
            refetchOnMount: false, // Disables automatic refetching when component is mounted.
          },
        },
      }),
  );
  const { resolved } = useTheme();
  const muiTheme = useMemo(() => buildMuiTheme(resolved), [resolved]);
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressBar
        color="#00ABE4"
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
      />

      {/* MUI palette follows the dashboard theme (utils/muiTheme.ts) */}
      <MuiThemeProvider theme={muiTheme}>
        <Component {...pageProps} />
      </MuiThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
