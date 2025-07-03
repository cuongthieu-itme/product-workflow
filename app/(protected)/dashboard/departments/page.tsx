'use client'

import { useState } from 'react'
import { DepartmentsTable } from '@/components/departments/departments-table'
import { AddDepartmentForm } from '@/components/departments/add-department-form'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export default function DepartmentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDepartmentAdded = () => {
    // Trigger a refresh of the departments table
    setRefreshTrigger((prev) => prev + 1)
    // Đóng dialog sau khi thêm thành công
    setTimeout(() => {
      setIsDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý phòng ban
          </h2>
          <p className="text-muted-foreground">
            Quản lý các phòng ban trong hệ thống, phân quyền và phân công nhân
            sự.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo phòng ban
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tạo phòng ban mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo phòng ban mới. Nhấn nút Tạo phòng ban khi
                hoàn tất.
              </DialogDescription>
            </DialogHeader>
            <AddDepartmentForm onDepartmentAdded={handleDepartmentAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <DepartmentsTable key={`departments-table-${refreshTrigger}`} />
      </div>
    </div>
  )
}
