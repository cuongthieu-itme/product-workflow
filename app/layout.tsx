import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TanstackQueryProvider } from "@/providers";
import { Toaster } from "sonner";
import { Toaster as ToasterUI } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Product Development Dashboard",
  description: "Comprehensive product development workflow management system",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TanstackQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToasterUI />

            <Toaster position="top-center" />
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
