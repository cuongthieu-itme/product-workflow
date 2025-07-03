import type { Metadata } from 'next'
import LoginClient from './client'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào hệ thống quản lý sản phẩm'
}

export default function LoginPage() {
  return <LoginClient />
}
