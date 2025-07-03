'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface FirebaseErrorHandlerProps {
  error: string | null
  onRetry?: () => void
  isAuthenticated?: boolean
}

export function FirebaseErrorHandler({
  error,
  onRetry,
  isAuthenticated
}: FirebaseErrorHandlerProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lỗi kết nối Firebase</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{error}</p>
        {error.includes('permissions') && !isAuthenticated && (
          <p className="mb-2 font-medium">
            Bạn cần đăng nhập để truy cập dữ liệu. Vui lòng{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              đăng nhập
            </a>{' '}
            để tiếp tục.
          </p>
        )}
        {error.includes('permissions') && isAuthenticated && (
          <p className="mb-2 font-medium">
            Tài khoản của bạn không có quyền truy cập dữ liệu này. Vui lòng liên
            hệ quản trị viên để được cấp quyền.
          </p>
        )}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
