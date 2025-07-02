"use client"

import { PermissionsManager } from "@/components/permissions/permissions-manager"
import { PermissionsProvider } from "@/components/permissions-context"

export default function PermissionsPageClient() {
  return (
    <PermissionsProvider>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Quyền Truy Cập</h1>
          <p className="text-muted-foreground">Quản lý quyền truy cập của các phòng ban trong hệ thống</p>
        </div>

        <PermissionsManager />
      </div>
    </PermissionsProvider>
  )
}
