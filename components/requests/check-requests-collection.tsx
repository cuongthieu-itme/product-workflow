'use client'

import { useState } from 'react'
import { useRequest } from './request-context-firebase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function CheckRequestsCollection() {
  const { checkAndCreateRequestsCollection, refreshData } = useRequest()
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleCheck = async () => {
    setChecking(true)
    setResult(null)

    try {
      const success = await checkAndCreateRequestsCollection()

      if (success) {
        setResult({
          success: true,
          message:
            "Collection 'requests' đã tồn tại hoặc đã được tạo thành công!"
        })
        // Làm mới dữ liệu sau khi tạo collection
        await refreshData()
      } else {
        setResult({
          success: false,
          message:
            "Không thể kiểm tra hoặc tạo collection 'requests'. Vui lòng kiểm tra quyền truy cập và kết nối."
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Lỗi: ${error.message}`
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Kiểm tra Collection Requests</CardTitle>
        <CardDescription>
          Kiểm tra xem collection "requests" đã tồn tại trong Firestore chưa và
          tạo nếu cần thiết
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert
            className={
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }
          >
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{result.success ? 'Thành công' : 'Lỗi'}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCheck} disabled={checking} className="w-full">
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            'Kiểm tra và tạo collection'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
