import { UserManagementTabs } from "@/features/users/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý người dùng - Hệ thống quản lý yêu cầu",
  description: "Quản lý tài khoản người dùng trong hệ thống",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground">
          Quản lý tài khoản và phân quyền người dùng trong hệ thống
        </p>
      </div>

      <UserManagementTabs />
    </div>
  );
}
