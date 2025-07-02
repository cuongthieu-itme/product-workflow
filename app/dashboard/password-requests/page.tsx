import type { Metadata } from "next"
import { PasswordResetRequests } from "@/components/users/password-reset-requests"

export const metadata: Metadata = {
  title: "Yêu cầu đặt lại mật khẩu",
  description: "Quản lý các yêu cầu đặt lại mật khẩu",
}

export default function PasswordRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Yêu cầu đặt lại mật khẩu</h3>
        <p className="text-sm text-muted-foreground">Quản lý các yêu cầu đặt lại mật khẩu từ người dùng.</p>
      </div>
      <div className="border rounded-md">
        <PasswordResetRequests />
      </div>
    </div>
  )
}
