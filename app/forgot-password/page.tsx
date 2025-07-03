import { ForgotPasswordPage } from '@/pages/auth/components/forgot-password'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
  description: 'Quên mật khẩu vào hệ thống quản lý sản phẩm'
}

export default function Page() {
  return <ForgotPasswordPage />
}
