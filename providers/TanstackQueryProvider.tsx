"use client";

import {
  QueryClient,
  QueryClientProvider as ReactQueryProvider,
} from "@tanstack/react-query";
import { ReactNode } from "react";

const TanstackQueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <ReactQueryProvider client={queryClient}>{children}</ReactQueryProvider>
  );
};

export { TanstackQueryProvider };
