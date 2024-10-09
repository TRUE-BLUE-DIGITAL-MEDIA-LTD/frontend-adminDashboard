import "../styles/globals.css";
import "primereact/resources/themes/bootstrap4-light-purple/theme.css";
import type { AppProps } from "next/app";
import { PagesProgressBar as ProgressBar } from "next-nprogress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressBar
        color="#00ABE4"
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
      />

      <Component {...pageProps} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
