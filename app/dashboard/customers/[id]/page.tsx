'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomers } from '@/components/customers/customer-context'
import { CustomerRequests } from '@/components/customers/customer-requests'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const { getCustomerById, loading } = useCustomers()
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    if (customerId) {
      const customerData = getCustomerById(customerId)
      setCustomer(customerData)
    }
  }, [customerId, getCustomerById])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Không tìm thấy khách hàng
              </h2>
              <p className="text-gray-500 mt-2">
                Khách hàng không tồn tại hoặc đã bị xóa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Chi tiết khách hàng: {customer.name}
      </h1>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="requests">Yêu cầu</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <CustomerDetail customerId={customerId} />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <CustomerRequests customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
