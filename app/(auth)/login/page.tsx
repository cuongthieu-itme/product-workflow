import { LoginPage } from "@/pages/auth/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào hệ thống quản lý sản phẩm",
};

export default function Page() {
  if (typeof window !== "undefined") {
    return <LoginPage />;
  }

  return <></>;
}
