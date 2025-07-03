'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testFirebaseConnection } from '@/lib/firebase-debug'
import { useToast } from '@/components/ui/use-toast'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function DebugFirebase() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const testResult = await testFirebaseConnection()
      setResult(testResult)

      toast({
        title: testResult.success ? 'Thành công' : 'Lỗi',
        description: testResult.message,
        variant: testResult.success ? 'default' : 'destructive'
      })
    } catch (error) {
      console.error('Lỗi khi kiểm tra kết nối:', error)
      setResult({
        success: false,
        message: `Lỗi không xác định: ${error instanceof Error ? error.message : 'Không có thông tin chi tiết'}`,
        error
      })

      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra kết nối Firebase',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkSubWorkflows = async () => {
    setLoading(true)
    try {
      const collectionRef = collection(db, 'subWorkflows')
      const snapshot = await getDocs(collectionRef)

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      setResult({
        success: true,
        message: `Tìm thấy ${snapshot.size} quy trình con`,
        data
      })

      toast({
        title: 'Thành công',
        description: `Tìm thấy ${snapshot.size} quy trình con`
      })
    } catch (error) {
      console.error('Lỗi khi kiểm tra subWorkflows:', error)
      setResult({
        success: false,
        message: `Lỗi khi kiểm tra subWorkflows: ${error instanceof Error ? error.message : 'Không có thông tin chi tiết'}`,
        error
      })

      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra collection subWorkflows',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kiểm tra kết nối Firebase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleTestConnection} disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </Button>
          <Button
            onClick={checkSubWorkflows}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra subWorkflows'}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3
              className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}
            >
              {result.success ? 'Thành công' : 'Lỗi'}
            </h3>
            <p className="mt-1">{result.message}</p>

            {result.data && (
              <div className="mt-2">
                <h4 className="font-medium">Dữ liệu:</h4>
                <pre className="mt-1 p-2 bg-muted rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
