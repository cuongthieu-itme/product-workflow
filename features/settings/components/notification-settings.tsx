'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    emailNotifications: true,
    productUpdates: true,
    marketingUpdates: false,
    taskAssignments: true,
    commentMentions: true,
    dailyDigest: true,
    notificationFrequency: 'immediate'
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Thông báo qua email</h3>
          <p className="text-sm text-muted-foreground">
            Cấu hình thông báo qua email cho các hoạt động trong hệ thống
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="flex-1">
              Bật thông báo qua email
            </Label>
            <Switch
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) =>
                handleInputChange('emailNotifications', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="productUpdates" className="flex-1">
              Cập nhật sản phẩm
            </Label>
            <Switch
              id="productUpdates"
              checked={formData.productUpdates}
              onCheckedChange={(checked) =>
                handleInputChange('productUpdates', checked)
              }
              disabled={!formData.emailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketingUpdates" className="flex-1">
              Cập nhật marketing
            </Label>
            <Switch
              id="marketingUpdates"
              checked={formData.marketingUpdates}
              onCheckedChange={(checked) =>
                handleInputChange('marketingUpdates', checked)
              }
              disabled={!formData.emailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="taskAssignments" className="flex-1">
              Phân công nhiệm vụ
            </Label>
            <Switch
              id="taskAssignments"
              checked={formData.taskAssignments}
              onCheckedChange={(checked) =>
                handleInputChange('taskAssignments', checked)
              }
              disabled={!formData.emailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="commentMentions" className="flex-1">
              Đề cập trong bình luận
            </Label>
            <Switch
              id="commentMentions"
              checked={formData.commentMentions}
              onCheckedChange={(checked) =>
                handleInputChange('commentMentions', checked)
              }
              disabled={!formData.emailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dailyDigest" className="flex-1">
              Tóm tắt hàng ngày
            </Label>
            <Switch
              id="dailyDigest"
              checked={formData.dailyDigest}
              onCheckedChange={(checked) =>
                handleInputChange('dailyDigest', checked)
              }
              disabled={!formData.emailNotifications}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Tùy chọn thông báo</h3>
          <p className="text-sm text-muted-foreground">
            Cấu hình tần suất và cách thức nhận thông báo
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="notificationFrequency">Tần suất thông báo</Label>
            <Select
              value={formData.notificationFrequency}
              onValueChange={(value) =>
                handleInputChange('notificationFrequency', value)
              }
            >
              <SelectTrigger id="notificationFrequency">
                <SelectValue placeholder="Chọn tần suất thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Ngay lập tức</SelectItem>
                <SelectItem value="hourly">Hàng giờ</SelectItem>
                <SelectItem value="daily">Hàng ngày</SelectItem>
                <SelectItem value="weekly">Hàng tuần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu cài đặt
        </Button>
      </div>
    </form>
  )
}
