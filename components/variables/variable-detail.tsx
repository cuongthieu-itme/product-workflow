"use client"

import type { AvailableVariable } from "./available-variables-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VariableDetailProps {
  variable: AvailableVariable
}

export function VariableDetail({ variable }: VariableDetailProps) {
  // Lấy tên hiển thị cho nguồn
  const getSourceName = (source: string) => {
    switch (source) {
      case "request":
        return "Yêu cầu"
      case "system":
        return "Hệ thống"
      case "custom":
        return "Tùy chỉnh"
      default:
        return source
    }
  }

  // Lấy tên hiển thị cho loại
  const getTypeName = (type: string) => {
    switch (type) {
      case "text":
        return "Văn bản"
      case "date":
        return "Ngày tháng"
      case "user":
        return "Người dùng"
      case "number":
        return "Số"
      case "select":
        return "Lựa chọn"
      case "currency":
        return "Tiền tệ"
      case "checkbox":
        return "Hộp kiểm"
      default:
        return type
    }
  }

  // Lấy màu badge cho nguồn
  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "system":
        return "default"
      case "request":
        return "secondary"
      case "custom":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {variable.name}
            <div className="flex gap-2">
              <Badge variant={getSourceBadgeVariant(variable.source)}>{getSourceName(variable.source)}</Badge>
              <Badge variant="secondary">{getTypeName(variable.type)}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mô tả */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Mô tả</h4>
            <p className="text-sm">{variable.description || "Không có mô tả"}</p>
          </div>

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Loại dữ liệu</h4>
              <p className="text-sm">{getTypeName(variable.type)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Nguồn</h4>
              <p className="text-sm">{getSourceName(variable.source)}</p>
            </div>
          </div>

          {/* Bắt buộc */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Trường bắt buộc</h4>
            <Badge variant={variable.isRequired ? "destructive" : "outline"}>
              {variable.isRequired ? "Bắt buộc" : "Tùy chọn"}
            </Badge>
          </div>

          {/* Giá trị mặc định */}
          {variable.defaultValue !== undefined && variable.defaultValue !== "" && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Giá trị mặc định</h4>
              <p className="text-sm">
                {variable.type === "checkbox"
                  ? variable.defaultValue
                    ? "Được chọn"
                    : "Không được chọn"
                  : String(variable.defaultValue)}
              </p>
            </div>
          )}

          {/* Tùy chọn cho select */}
          {variable.type === "select" && variable.options && variable.options.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Các tùy chọn</h4>
              <div className="flex flex-wrap gap-1">
                {variable.options.map((option, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin thời gian */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Ngày tạo</h4>
              <p className="text-sm">{variable.createdAt.toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Cập nhật lần cuối</h4>
              <p className="text-sm">{variable.updatedAt.toLocaleString("vi-VN")}</p>
            </div>
          </div>

          {/* Người tạo/cập nhật */}
          {(variable.createdBy || variable.updatedBy) && (
            <div className="grid grid-cols-2 gap-4">
              {variable.createdBy && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Người tạo</h4>
                  <p className="text-sm">{variable.createdBy}</p>
                </div>
              )}
              {variable.updatedBy && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Người cập nhật</h4>
                  <p className="text-sm">{variable.updatedBy}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
