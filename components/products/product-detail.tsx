"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Edit, FileUp, MessageSquare } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: string
  name: string
  description: string
  status: string
  currentStep?: number
  totalSteps?: number
  progress?: number
  createdAt: string
  updatedAt: string
  departments?: string[]
  sku?: string
  designFiles?: string[]
  specifications?: string
  steps?: any[]
  comments?: any[]
}

export function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        throw new Error("Product not found")
      }
      const result = await response.json()

      // API trả về { success: true, data: {...} }
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        throw new Error("Product data not found")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải chi tiết sản phẩm...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <span>Lỗi: {error || "Không tìm thấy sản phẩm"}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
            <Badge variant="outline">{product.status}</Badge>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh Sửa
          </Button>
          <Button>Tiếp Tục Quy Trình</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="files">Tệp & Thiết Kế</TabsTrigger>
          <TabsTrigger value="comments">Bình Luận</TabsTrigger>
          <TabsTrigger value="history">Lịch Sử</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Sản Phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Mã SKU</h4>
                  <p>{product.sku || "Chưa có"}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Trạng Thái</h4>
                  <p>{product.status}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Ngày Tạo</h4>
                  <p>{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Cập Nhật Gần Nhất</h4>
                  <p>{formatDate(product.updatedAt)}</p>
                </div>
              </div>
              {product.specifications && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Thông Số Kỹ Thuật</h4>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{product.specifications}</pre>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tệp Thiết Kế</CardTitle>
                <CardDescription>Các tệp thiết kế của sản phẩm</CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <FileUp className="h-4 w-4" />
                Tải Lên
              </Button>
            </CardHeader>
            <CardContent>
              {product.designFiles && product.designFiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {product.designFiles.map((file, index) => (
                    <div key={index} className="rounded-md border p-4">
                      <div className="aspect-square w-full bg-muted"></div>
                      <div className="mt-2">
                        <p className="font-medium">{file}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(product.updatedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa có tệp thiết kế nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bình Luận</CardTitle>
              <CardDescription>Các bình luận và thảo luận về sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.comments && product.comments.length > 0 ? (
                product.comments.map((comment, index) => (
                  <div key={index} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{comment.user || "Người dùng"}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt || product.updatedAt)}
                      </div>
                    </div>
                    <p className="mt-2">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa có bình luận nào</p>
              )}
              <div className="flex items-center gap-2">
                <Input placeholder="Thêm bình luận..." />
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Gửi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Hoạt Động</CardTitle>
              <CardDescription>Lịch sử các hoạt động và thay đổi của sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Edit className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Sản phẩm được tạo</div>
                      <div className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">Sản phẩm {product.name} đã được tạo trong hệ thống</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
