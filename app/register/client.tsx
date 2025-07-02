"use client"

import dynamic from "next/dynamic"

// Import client component với dynamic import để tránh SSR
const RegisterPageClient = dynamic(() => import("@/components/auth/register-page-client"), {
  ssr: false,
})

export default function RegisterClient() {
  return <RegisterPageClient />
}
