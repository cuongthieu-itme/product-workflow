"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState({
    fontSize: "medium",
    language: "vi",
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
          <h3 className="text-lg font-medium">Giao diện</h3>
          <p className="text-sm text-muted-foreground">Tùy chỉnh giao diện người dùng theo sở thích của bạn</p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Chủ đề</Label>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-2 h-10 w-10 rounded-full bg-[#eaeaea] shadow-sm" />
                  <span>Sáng</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-2 h-10 w-10 rounded-full bg-[#262626] shadow-sm" />
                  <span>Tối</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-2 h-10 w-10 rounded-full bg-gradient-to-r from-[#eaeaea] to-[#262626] shadow-sm" />
                  <span>Hệ thống</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Tùy chọn hiển thị</h3>
          <p className="text-sm text-muted-foreground">Tùy chỉnh cách hiển thị nội dung</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fontSize">Cỡ chữ</Label>
            <Select value={formData.fontSize} onValueChange={(value) => handleInputChange("fontSize", value)}>
              <SelectTrigger id="fontSize">
                <SelectValue placeholder="Chọn cỡ chữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Nhỏ</SelectItem>
                <SelectItem value="medium">Vừa</SelectItem>
                <SelectItem value="large">Lớn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Ngôn ngữ</Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">Tiếng Anh</SelectItem>
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
