import type React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản Lý Quyền Truy Cập - ProductFlow',
  description: 'Quản lý quyền truy cập của các phòng ban trong hệ thống'
}

export default function PermissionsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
