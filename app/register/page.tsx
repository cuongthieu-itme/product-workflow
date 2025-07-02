import type { Metadata } from "next"
import RegisterClient from "./client"
import { FirebaseConnectionChecker } from "@/components/firebase-connection-checker"

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký tài khoản mới",
}

export default function RegisterPage() {
  return (
    <>
      <div className="container mx-auto p-4">
        <FirebaseConnectionChecker />
      </div>
      <RegisterClient />
    </>
  )
}
