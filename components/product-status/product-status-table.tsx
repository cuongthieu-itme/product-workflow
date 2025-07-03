'use client'

import { useState } from 'react'
import { useProductStatus } from './product-status-context-firebase'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye } from 'lucide-react'
import { ProductStatusDetail } from './product-status-detail'
import { AddProductStatusForm } from './add-product-status-form'

export function ProductStatusTable() {
  const { productStatuses, deleteProductStatus } = useProductStatus()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null)
  const [detailStatusId, setDetailStatusId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<{
    id: string
    name: string
    description: string
    color?: string
  } | null>(null)

  const handleDeleteClick = (id: string) => {
    setStatusToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (statusToDelete) {
      await deleteProductStatus(statusToDelete)
      setIsDeleteDialogOpen(false)
      setStatusToDelete(null)
    }
  }

  const handleViewDetail = (id: string) => {
    setDetailStatusId(id)
    setIsDetailOpen(true)
  }

  const handleEditClick = (status: any) => {
    setEditingStatus({
      id: status.id,
      name: status.name,
      description: status.description,
      color: status.color
    })
    setIsEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setIsEditDialogOpen(false)
    setEditingStatus(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Màu</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!productStatuses || productStatuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              productStatuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color || '#888888' }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {status.name}
                    {status.isDefault && (
                      <Badge variant="outline" className="ml-2">
                        Mặc định
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{status.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(status.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Xem chi tiết</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(status)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Sửa</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(status.id)}
                        disabled={status.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Trạng thái này sẽ bị xóa vĩnh
              viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailStatusId && (
        <ProductStatusDetail
          statusId={detailStatusId}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}

      {editingStatus && (
        <AddProductStatusForm
          isOpen={isEditDialogOpen}
          onClose={handleEditClose}
          editingStatus={editingStatus}
          onSuccess={() => {
            handleEditClose()
          }}
        />
      )}
    </>
  )
}
