"use client";

import dynamic from "next/dynamic";

// Import client component với dynamic import để tránh SSR
const RegisterPageClient = dynamic(
  () => import("@/pages/auth/components/register-page-client"),
  {
    ssr: false,
  }
);

export default function RegisterClient() {
  return <RegisterPageClient />;
}
