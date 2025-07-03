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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

export function ProductForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'furniture',
    departments: ['product']
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDepartmentChange = (department: string, checked: boolean) => {
    setFormData((prev) => {
      const currentDepts = prev.departments || []
      return {
        ...prev,
        departments: checked
          ? [...currentDepts, department]
          : currentDepts.filter((d) => d !== department)
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Giả lập gửi dữ liệu lên server
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard/products')
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Sản Phẩm</CardTitle>
          <CardDescription>
            Nhập thông tin chi tiết về sản phẩm mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên Sản Phẩm</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Nhập mô tả chi tiết về sản phẩm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Danh Mục Sản Phẩm</Label>
            <RadioGroup
              id="category"
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="furniture" id="furniture" />
                <Label htmlFor="furniture">Nội Thất</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="electronics" id="electronics" />
                <Label htmlFor="electronics">Điện Tử</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accessories" id="accessories" />
                <Label htmlFor="accessories">Phụ Kiện</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Khác</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Phòng Ban Liên Quan</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="product"
                  checked={formData.departments?.includes('product')}
                  onCheckedChange={(checked) =>
                    handleDepartmentChange('product', !!checked)
                  }
                />
                <Label htmlFor="product">Phòng Sản Phẩm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="design"
                  checked={formData.departments?.includes('design')}
                  onCheckedChange={(checked) =>
                    handleDepartmentChange('design', !!checked)
                  }
                />
                <Label htmlFor="design">Phòng Thiết Kế</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.departments?.includes('marketing')}
                  onCheckedChange={(checked) =>
                    handleDepartmentChange('marketing', !!checked)
                  }
                />
                <Label htmlFor="marketing">Phòng Marketing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sales"
                  checked={formData.departments?.includes('sales')}
                  onCheckedChange={(checked) =>
                    handleDepartmentChange('sales', !!checked)
                  }
                />
                <Label htmlFor="sales">Phòng Kinh Doanh</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="operations"
                  checked={formData.departments?.includes('operations')}
                  onCheckedChange={(checked) =>
                    handleDepartmentChange('operations', !!checked)
                  }
                />
                <Label htmlFor="operations">Phòng Vận Hành</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo Sản Phẩm
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
