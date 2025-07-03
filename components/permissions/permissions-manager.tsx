'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  usePermissions,
  type WorkflowArea,
  type PermissionType
} from '@/components/permissions-context'
import { PermissionsTable } from '@/components/permissions/permissions-table'
import { PermissionsByDepartment } from '@/components/permissions/permissions-by-department'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

export function PermissionsManager() {
  const { permissions, updatePermission } = usePermissions()
  const { toast } = useToast()
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  )

  // Danh sách các phòng ban
  const departments = [
    { id: 'product', name: 'Phòng Sản Phẩm' },
    { id: 'design', name: 'Phòng Thiết Kế' },
    { id: 'marketing', name: 'Phòng Marketing' },
    { id: 'sales', name: 'Phòng Kinh Doanh' },
    { id: 'operations', name: 'Phòng Vận Hành' }
  ]

  // Danh sách các khu vực trong quy trình
  const workflowAreas: { id: WorkflowArea; name: string }[] = [
    { id: 'request', name: 'Khởi Tạo Yêu Cầu' },
    { id: 'review', name: 'Kiểm Tra Phát Triển' },
    { id: 'design', name: 'Thiết Kế & Xác Nhận' },
    { id: 'production', name: 'Cập Nhật SKU & Thông Tin' },
    { id: 'marketing', name: 'Truyền Thông Marketing' },
    { id: 'launch', name: 'Ra Mắt & Hoạt Động Sau Ra Mắt' },
    { id: 'reports', name: 'Báo Cáo' },
    { id: 'users', name: 'Quản Lý Người Dùng' },
    { id: 'settings', name: 'Cài Đặt Hệ Thống' }
  ]

  // Các loại quyền
  const permissionTypes: {
    id: PermissionType
    name: string
    description: string
  }[] = [
    { id: 'edit', name: 'Chỉnh Sửa', description: 'Cho phép xem và chỉnh sửa' },
    {
      id: 'view',
      name: 'Xem',
      description: 'Chỉ cho phép xem, không chỉnh sửa'
    },
    { id: 'hide', name: 'Ẩn', description: 'Không cho phép xem hoặc truy cập' }
  ]

  // Cập nhật quyền và hiển thị thông báo
  const handleUpdatePermission = (
    department: string,
    area: WorkflowArea,
    permission: PermissionType
  ) => {
    updatePermission(department, area, permission)

    toast({
      title: 'Cập nhật thành công',
      description: `Đã cập nhật quyền cho ${getDepartmentName(department)} đối với khu vực ${getAreaName(area)}.`
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Lấy tên phòng ban từ ID
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((d) => d.id === departmentId)
    return department ? department.name : departmentId
  }

  // Lấy tên khu vực từ ID
  const getAreaName = (areaId: WorkflowArea): string => {
    const area = workflowAreas.find((a) => a.id === areaId)
    return area ? area.name : areaId
  }

  // Đặt lại quyền về mặc định
  const resetToDefault = () => {
    // Đặt lại quyền cho từng phòng ban và khu vực
    departments.forEach((department) => {
      workflowAreas.forEach((area) => {
        let defaultPermission: PermissionType = 'view'

        // Quyền mặc định dựa trên phòng ban và khu vực
        if (department.id === area.id) {
          defaultPermission = 'edit'
        } else if (department.id === 'admin') {
          defaultPermission = 'edit'
        }

        updatePermission(department.id, area.id, defaultPermission)
      })
    })

    toast({
      title: 'Đặt lại thành công',
      description: 'Đã đặt lại tất cả quyền truy cập về mặc định.'
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Cập nhật thành công!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            Quyền truy cập đã được cập nhật thành công và sẽ được áp dụng ngay
            lập tức.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="table" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="table">Bảng Quyền Truy Cập</TabsTrigger>
            <TabsTrigger value="department">Theo Phòng Ban</TabsTrigger>
          </TabsList>

          <Button variant="outline" onClick={resetToDefault}>
            Đặt Lại Mặc Định
          </Button>
        </div>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng Quyền Truy Cập</CardTitle>
              <CardDescription>
                Quản lý quyền truy cập của tất cả phòng ban đối với các khu vực
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsTable
                departments={departments}
                workflowAreas={workflowAreas}
                permissionTypes={permissionTypes}
                permissions={permissions}
                onUpdatePermission={handleUpdatePermission}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quyền Truy Cập Theo Phòng Ban</CardTitle>
              <CardDescription>
                Quản lý quyền truy cập chi tiết cho từng phòng ban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsByDepartment
                departments={departments}
                workflowAreas={workflowAreas}
                permissionTypes={permissionTypes}
                permissions={permissions}
                onUpdatePermission={handleUpdatePermission}
                selectedDepartment={selectedDepartment}
                onSelectDepartment={setSelectedDepartment}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
