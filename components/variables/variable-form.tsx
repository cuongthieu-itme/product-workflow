"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAvailableVariables, type AvailableVariable } from "./available-variables-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface VariableFormProps {
  variable?: AvailableVariable
  onSuccess: () => void
  onCancel: () => void
}

export function VariableForm({ variable, onSuccess, onCancel }: VariableFormProps) {
  const { addVariable, updateVariable, isVariableNameExists } = useAvailableVariables()
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState("")

  const [formData, setFormData] = useState({
    name: variable?.name || "",
    description: variable?.description || "",
    source: variable?.source || ("custom" as const),
    type: variable?.type || ("text" as const),
    options: variable?.options || [],
    defaultValue: variable?.defaultValue || "",
    isRequired: variable?.isRequired || false,
    userSource: variable?.userSource || "users", // Thêm trường userSource
  })

  const [newOption, setNewOption] = useState("")

  // Kiểm tra tên trùng lặp
  useEffect(() => {
    if (formData.name.trim()) {
      const exists = isVariableNameExists(formData.name.trim(), variable?.id)
      setNameError(exists ? "Tên trường dữ liệu đã tồn tại" : "")
    } else {
      setNameError("")
    }
  }, [formData.name, isVariableNameExists, variable?.id])

  // Xử lý thay đổi form
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Thêm option cho select
  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }))
      setNewOption("")
    }
  }

  // Xóa option
  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setNameError("Vui lòng nhập tên trường dữ liệu")
      return
    }

    if (nameError) {
      return
    }

    if ((formData.type === "select" || formData.type === "multiselect") && formData.options.length === 0) {
      alert("Vui lòng thêm ít nhất một tùy chọn cho trường lựa chọn")
      return
    }

    setLoading(true)
    try {
      // Tạo object data và chỉ thêm các trường có giá trị
      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        source: formData.source,
        type: formData.type,
        isRequired: formData.isRequired,
      }

      // Chỉ thêm options nếu là type select hoặc multiselect và có giá trị
      if ((formData.type === "select" || formData.type === "multiselect") && formData.options.length > 0) {
        data.options = formData.options
      }

      // Chỉ thêm defaultValue nếu có giá trị
      if (formData.defaultValue !== "" && formData.defaultValue !== null && formData.defaultValue !== undefined) {
        data.defaultValue = formData.defaultValue
      }

      // Chỉ thêm userSource nếu là type user
      if (formData.type === "user") {
        data.userSource = formData.userSource
      }

      if (variable) {
        await updateVariable(variable.id, data)
      } else {
        await addVariable(data)
      }

      onSuccess()
    } catch (error) {
      // Lỗi đã được xử lý trong context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên trường */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Tên trường dữ liệu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nhập tên trường dữ liệu"
            className={nameError ? "border-red-500" : ""}
          />
          {nameError && <p className="text-sm text-red-500">{nameError}</p>}
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Nhập mô tả cho trường dữ liệu"
            rows={3}
          />
        </div>

        {/* Nguồn */}
        <div className="space-y-2">
          <Label htmlFor="source">Nguồn dữ liệu</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => handleChange("source", value)}
            disabled={!!variable} // Không cho phép thay đổi nguồn khi chỉnh sửa
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nguồn dữ liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
              <SelectItem value="request">Yêu cầu</SelectItem>
              <SelectItem value="system">Hệ thống</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loại dữ liệu */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Loại dữ liệu <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại dữ liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Văn bản</SelectItem>
              <SelectItem value="date">Ngày tháng</SelectItem>
              <SelectItem value="datetime">Ngày giờ</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
              <SelectItem value="number">Số</SelectItem>
              <SelectItem value="select">Lựa chọn đơn</SelectItem>
              <SelectItem value="multiselect">Lựa chọn nhiều</SelectItem>
              <SelectItem value="currency">Tiền tệ</SelectItem>
              <SelectItem value="checkbox">Hộp kiểm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nguồn người dùng - chỉ hiển thị khi type là user */}
        {formData.type === "user" && (
          <div className="space-y-2">
            <Label htmlFor="userSource">
              Nguồn người dùng <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.userSource} onValueChange={(value) => handleChange("userSource", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nguồn người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">Người dùng hệ thống</SelectItem>
                <SelectItem value="customers">Khách hàng</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formData.userSource === "users"
                ? "Dữ liệu sẽ được lấy từ bảng users (nhân viên, quản trị viên)"
                : "Dữ liệu sẽ được lấy từ bảng customers (khách hàng)"}
            </p>
          </div>
        )}

        {/* Tùy chọn cho select và multiselect */}
        {(formData.type === "select" || formData.type === "multiselect") && (
          <div className="space-y-2">
            <Label>Các tùy chọn</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nhập tùy chọn mới"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addOption()
                    }
                  }}
                />
                <Button type="button" onClick={addOption} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options.map((option, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {option}
                    <button type="button" onClick={() => removeOption(index)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Giá trị mặc định */}
        <div className="space-y-2">
          <Label htmlFor="defaultValue">Giá trị mặc định</Label>
          {formData.type === "select" ? (
            <Select
              value={formData.defaultValue as string}
              onValueChange={(value) => handleChange("defaultValue", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giá trị mặc định" />
              </SelectTrigger>
              <SelectContent>
                {formData.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : formData.type === "multiselect" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Chọn các giá trị mặc định:</p>
              <div className="space-y-2">
                {formData.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`default-${option}`}
                      checked={Array.isArray(formData.defaultValue) && formData.defaultValue.includes(option)}
                      onCheckedChange={(checked) => {
                        const currentDefaults = Array.isArray(formData.defaultValue) ? formData.defaultValue : []
                        if (checked) {
                          handleChange("defaultValue", [...currentDefaults, option])
                        } else {
                          handleChange(
                            "defaultValue",
                            currentDefaults.filter((v) => v !== option),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`default-${option}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ) : formData.type === "user" ? (
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              Giá trị mặc định cho trường người dùng sẽ được thiết lập tự động dựa trên người dùng hiện tại hoặc có thể
              để trống.
            </div>
          ) : (
            <Input
              id="defaultValue"
              type={
                formData.type === "number"
                  ? "number"
                  : formData.type === "date"
                    ? "date"
                    : formData.type === "datetime"
                      ? "datetime-local"
                      : "text"
              }
              value={formData.defaultValue as string}
              onChange={(e) => handleChange("defaultValue", e.target.value)}
              placeholder="Nhập giá trị mặc định"
            />
          )}
        </div>

        {/* Bắt buộc */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRequired"
            checked={formData.isRequired}
            onCheckedChange={(checked) => handleChange("isRequired", checked)}
          />
          <Label htmlFor="isRequired" className="text-sm">
            Trường bắt buộc
          </Label>
        </div>

        {/* Buttons - đặt sticky ở bottom */}
        <div className="sticky bottom-0 bg-background pt-4 border-t mt-6">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !!nameError || !formData.name.trim()}>
              {loading ? "Đang xử lý..." : variable ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
