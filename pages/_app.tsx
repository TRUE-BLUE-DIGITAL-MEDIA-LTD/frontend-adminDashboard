import "../styles/globals.css";
import type { AppProps } from "next/app";
import NextTopLoader from "nextjs-toploader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60, // 1 hour in ms
            refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <NextTopLoader
        color="#00ABE4"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #2299DD,0 0 5px #2299DD"
      />

      <PrimeReactProvider>
        <Component {...pageProps} />
      </PrimeReactProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
