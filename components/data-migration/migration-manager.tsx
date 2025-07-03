'use client'

import { useState, useEffect } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  migrateToFirestore,
  clearFirestoreCollection,
  checkFirestoreCollection
} from '@/lib/migrate-to-firebase'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface MigrationStatus {
  key: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  message: string
  count: number
}

export function MigrationManager() {
  const [migrationStatuses, setMigrationStatuses] = useState<MigrationStatus[]>(
    [
      {
        key: 'workflows',
        name: 'Quy trình làm việc',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'productStatuses',
        name: 'Trạng thái sản phẩm',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'standardWorkflow',
        name: 'Quy trình chuẩn',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'subWorkflows',
        name: 'Quy trình con',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'materials',
        name: 'Nguyên vật liệu',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'materialRequests',
        name: 'Yêu cầu nguyên vật liệu',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'requests',
        name: 'Yêu cầu',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'dataSources',
        name: 'Nguồn dữ liệu',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'users',
        name: 'Người dùng',
        status: 'pending',
        message: '',
        count: 0
      },
      {
        key: 'departments',
        name: 'Phòng ban',
        status: 'pending',
        message: '',
        count: 0
      }
    ]
  )

  const [overallProgress, setOverallProgress] = useState(0)
  const [isMigrating, setIsMigrating] = useState(false)
  const [clearBeforeMigrate, setClearBeforeMigrate] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Kiểm tra trạng thái dữ liệu trong Firestore
  useEffect(() => {
    const checkCollections = async () => {
      const newStatuses = [...migrationStatuses]

      for (let i = 0; i < newStatuses.length; i++) {
        const status = newStatuses[i]
        const result = await checkFirestoreCollection(status.key)

        if (result.exists) {
          newStatuses[i] = {
            ...status,
            status: 'completed',
            message: `Đã tồn tại ${result.count} bản ghi trong Firestore`,
            count: result.count
          }
        }
      }

      setMigrationStatuses(newStatuses)
      updateProgress(newStatuses)
    }

    checkCollections()
  }, [])

  // Cập nhật tiến trình tổng thể
  const updateProgress = (statuses: MigrationStatus[]) => {
    const completed = statuses.filter((s) => s.status === 'completed').length
    setOverallProgress((completed / statuses.length) * 100)

    if (completed === statuses.length) {
      setMigrationComplete(true)
    }
  }

  // Thực hiện di chuyển dữ liệu
  const startMigration = async () => {
    setIsMigrating(true)
    setError(null)

    try {
      const newStatuses = [...migrationStatuses]

      for (let i = 0; i < newStatuses.length; i++) {
        const status = newStatuses[i]

        // Bỏ qua các collection đã hoàn thành trừ khi người dùng chọn xóa trước
        if (status.status === 'completed' && !clearBeforeMigrate) {
          continue
        }

        // Cập nhật trạng thái
        newStatuses[i] = {
          ...status,
          status: 'in_progress',
          message: 'Đang xử lý...'
        }
        setMigrationStatuses([...newStatuses])

        // Xóa dữ liệu hiện có nếu được chọn
        if (clearBeforeMigrate) {
          await clearFirestoreCollection(status.key)
        }

        // Biến đổi dữ liệu nếu cần
        const transform = (item: any) => {
          // Xử lý các trường ngày tháng
          const newItem = { ...item }

          // Chuyển đổi các trường ngày thành timestamp
          if (newItem.createdAt && typeof newItem.createdAt === 'string') {
            newItem.createdAt = new Date(newItem.createdAt)
          }

          if (newItem.updatedAt && typeof newItem.updatedAt === 'string') {
            newItem.updatedAt = new Date(newItem.updatedAt)
          }

          // Xử lý các trường đặc biệt khác nếu cần

          return newItem
        }

        // Di chuyển dữ liệu
        const result = await migrateToFirestore(
          status.key,
          status.key,
          transform
        )

        // Cập nhật trạng thái
        newStatuses[i] = {
          ...status,
          status: result.success ? 'completed' : 'failed',
          message: result.message,
          count: result.count
        }

        setMigrationStatuses([...newStatuses])
        updateProgress(newStatuses)
      }
    } catch (err: any) {
      setError(`Lỗi khi di chuyển dữ liệu: ${err.message}`)
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Di chuyển dữ liệu từ localStorage sang Firebase</CardTitle>
        <CardDescription>
          Công cụ này sẽ di chuyển tất cả dữ liệu từ localStorage sang Firestore
          Database
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="clearBeforeMigrate"
              checked={clearBeforeMigrate}
              onCheckedChange={(checked) =>
                setClearBeforeMigrate(checked as boolean)
              }
              disabled={isMigrating}
            />
            <Label htmlFor="clearBeforeMigrate">
              Xóa dữ liệu hiện có trong Firestore trước khi di chuyển
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Chọn tùy chọn này nếu bạn muốn xóa tất cả dữ liệu hiện có trong
            Firestore trước khi di chuyển. Điều này hữu ích khi bạn muốn đồng bộ
            lại dữ liệu.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Tiến trình tổng thể</h3>
            <span className="text-sm font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>

          <Progress value={overallProgress} className="h-2 mb-6" />

          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Loại dữ liệu</th>
                  <th className="px-4 py-2 text-left">Trạng thái</th>
                  <th className="px-4 py-2 text-left">Số lượng</th>
                  <th className="px-4 py-2 text-left">Thông báo</th>
                </tr>
              </thead>
              <tbody>
                {migrationStatuses.map((status) => (
                  <tr key={status.key} className="border-b">
                    <td className="px-4 py-2">{status.name}</td>
                    <td className="px-4 py-2">
                      {status.status === 'pending' && (
                        <span className="text-gray-500">Chưa xử lý</span>
                      )}
                      {status.status === 'in_progress' && (
                        <span className="text-blue-500">Đang xử lý</span>
                      )}
                      {status.status === 'completed' && (
                        <span className="text-green-500 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Hoàn thành
                        </span>
                      )}
                      {status.status === 'failed' && (
                        <span className="text-red-500 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Thất bại
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{status.count}</td>
                    <td className="px-4 py-2 text-sm">{status.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard')}
          disabled={isMigrating}
        >
          Quay lại Dashboard
        </Button>

        <Button
          onClick={startMigration}
          disabled={isMigrating || migrationComplete}
        >
          {isMigrating
            ? 'Đang di chuyển dữ liệu...'
            : migrationComplete
              ? 'Đã hoàn thành'
              : 'Bắt đầu di chuyển'}
        </Button>
      </CardFooter>
    </Card>
  )
}
