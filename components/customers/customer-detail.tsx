'use client'

import { useEffect, useState } from 'react'
import { useCustomers, type Customer } from './customer-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CustomerForm } from './customer-form'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Pencil, Phone, Mail, Calendar, User } from 'lucide-react'

interface CustomerDetailProps {
  customerId: string
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { getCustomerById, loading } = useCustomers()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    if (customerId) {
      const customerData = getCustomerById(customerId)
      setCustomer(customerData)
    }
  }, [customerId, getCustomerById])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'male':
        return 'Nam'
      case 'female':
        return 'Nữ'
      case 'other':
        return 'Khác'
      default:
        return 'N/A'
    }
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>
  }

  if (!customer) {
    return (
      <div className="text-center py-4">
        Không tìm thấy thông tin khách hàng
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thông tin khách hàng</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Họ tên</p>
            <p className="font-medium">{customer.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Số điện thoại</p>
            <p className="font-medium flex items-center">
              {customer.phone ? (
                <>
                  <Phone className="mr-1 h-4 w-4" />
                  {customer.phone}
                </>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium flex items-center">
              {customer.email ? (
                <>
                  <Mail className="mr-1 h-4 w-4" />
                  {customer.email}
                </>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nguồn khách hàng</p>
            <p className="font-medium">{customer.source || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày sinh</p>
            <p className="font-medium flex items-center">
              {customer.birthDate ? (
                <>
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(customer.birthDate)}
                </>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Giới tính</p>
            <p className="font-medium flex items-center">
              <User className="mr-1 h-4 w-4" />
              {formatGender(customer.gender)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="text-sm">{formatDate(customer.createdAt)}</p>
          </div>
          {customer.updatedAt && customer.updatedAt !== customer.createdAt && (
            <div className="space-y-1 mt-2">
              <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
              <p className="text-sm">{formatDate(customer.updatedAt)}</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customerId={customerId}
            onSuccess={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
