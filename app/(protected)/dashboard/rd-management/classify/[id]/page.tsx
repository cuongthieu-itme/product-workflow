'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Dữ liệu mẫu cho yêu cầu
const requestDetails = {
  id: 'REQ-001',
  title: 'Thiết kế bao bì sản phẩm mới',
  description:
    'Cần thiết kế bao bì mới cho dòng sản phẩm XYZ với các yêu cầu sau:\n- Phù hợp với thương hiệu\n- Thân thiện với môi trường\n- Dễ nhận diện trên kệ hàng',
  department: 'mkt',
  requestedBy: 'Nguyễn Văn A',
  createdAt: new Date(2023, 5, 15),
  priority: 'high',
  attachments: ['spec.pdf', 'reference.jpg']
}

export default function ClassifyRequestPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    reason: '',
    assignedTo: '',
    startDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)) // Default to 2 weeks from now
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (formData.status === '') {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn trạng thái cho yêu cầu',
        variant: 'destructive'
      })
      setIsLoading(false)
      return
    }

    if (
      (formData.status === 'deny' || formData.status === 'hold') &&
      !formData.reason
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối hoặc tạm hoãn',
        variant: 'destructive'
      })
      setIsLoading(false)
      return
    }

    if (
      (formData.status === 'new_design' || formData.status === 'template') &&
      !formData.assignedTo
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn người xử lý',
        variant: 'destructive'
      })
      setIsLoading(false)
      return
    }

    // Giả lập gửi dữ liệu
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: 'Thành công',
        description: `Đã phân loại yêu cầu ${params.id} thành công`
      })
      router.push('/dashboard/rd-management')
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Phân loại yêu cầu
          </h1>
          <p className="text-muted-foreground">
            Phân loại yêu cầu {params.id} và chỉ định người xử lý
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin yêu cầu</CardTitle>
            <CardDescription>Chi tiết yêu cầu cần phân loại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Mã yêu cầu</h3>
              <p>{requestDetails.id}</p>
            </div>
            <div>
              <h3 className="font-medium">Tiêu đề</h3>
              <p>{requestDetails.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Mô tả</h3>
              <p className="whitespace-pre-line">
                {requestDetails.description}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Phòng ban yêu cầu</h3>
              <p>
                {requestDetails.department === 'mkt'
                  ? 'Marketing'
                  : requestDetails.department === 'sales'
                    ? 'Sales'
                    : requestDetails.department === 'bod'
                      ? 'Ban Giám Đốc'
                      : 'R&D'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Người yêu cầu</h3>
              <p>{requestDetails.requestedBy}</p>
            </div>
            <div>
              <h3 className="font-medium">Ngày tạo</h3>
              <p>
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).format(requestDetails.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Mức độ ưu tiên</h3>
              <p>
                {requestDetails.priority === 'high'
                  ? 'Cao'
                  : requestDetails.priority === 'medium'
                    ? 'Trung bình'
                    : 'Thấp'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Tệp đính kèm</h3>
              <ul className="list-disc pl-5">
                {requestDetails.attachments.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân loại yêu cầu</CardTitle>
            <CardDescription>
              Chọn trạng thái và người xử lý cho yêu cầu này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="classify-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label>Trạng thái yêu cầu</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deny" id="deny" />
                    <Label htmlFor="deny" className="font-normal">
                      Từ chối yêu cầu
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hold" id="hold" />
                    <Label htmlFor="hold" className="font-normal">
                      Tạm hoãn yêu cầu
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new_design" id="new_design" />
                    <Label htmlFor="new_design" className="font-normal">
                      Sản phẩm thiết kế mới
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template" id="template" />
                    <Label htmlFor="template" className="font-normal">
                      Sản phẩm có sẵn template
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {(formData.status === 'deny' || formData.status === 'hold') && (
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Lý do {formData.status === 'deny' ? 'từ chối' : 'tạm hoãn'}
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    placeholder={`Nhập lý do ${formData.status === 'deny' ? 'từ chối' : 'tạm hoãn'} yêu cầu`}
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {(formData.status === 'new_design' ||
                formData.status === 'template') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Người xử lý</Label>
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(value) =>
                        handleChange('assignedTo', value)
                      }
                    >
                      <SelectTrigger id="assignedTo">
                        <SelectValue placeholder="Chọn người xử lý" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user1">Nguyễn Văn A</SelectItem>
                        <SelectItem value="user2">Trần Thị B</SelectItem>
                        <SelectItem value="user3">Lê Văn C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày bắt đầu</Label>
                      <DatePicker
                        date={formData.startDate}
                        setDate={(date) => handleChange('startDate', date)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hạn xử lý</Label>
                      <DatePicker
                        date={formData.dueDate}
                        setDate={(date) => handleChange('dueDate', date)}
                      />
                    </div>
                  </div>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" form="classify-form" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu phân loại
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
