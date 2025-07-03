import { ProtectedRoute } from "@/components/protected";
import type React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
