'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerForm } from '@/components/customers/customer-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewCustomerPage() {
  const router = useRouter()

  const handleSuccess = () => {
    console.log('✅ Customer added successfully, redirecting...')
    router.push('/dashboard/customers')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Thêm khách hàng mới</h1>
        <p className="text-muted-foreground">
          Điền thông tin để thêm khách hàng mới vào hệ thống
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
