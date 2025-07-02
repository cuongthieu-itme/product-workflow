import type { Metadata } from "next"
import PermissionsPageClient from "./permissions-page-client"

export const metadata: Metadata = {
  title: "Quản Lý Quyền Truy Cập - ProductFlow",
  description: "Quản lý quyền truy cập của các phòng ban trong hệ thống",
}

export default function PermissionsPage() {
  return <PermissionsPageClient />
}
