"use client";

import React, { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider as ReactQueryProvider,
} from "@tanstack/react-query";

const TanstackQueryProvider = ({ children }: { children: ReactNode }) => {
  // Create the client once and reuse it for the entire app life-cycle.
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ReactQueryProvider client={queryClient}>{children}</ReactQueryProvider>
  );
};

export { TanstackQueryProvider };
