import { RegisterPage } from "@/pages/auth/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký tài khoản mới",
};

export default function Page() {
  return <RegisterPage />;
}
