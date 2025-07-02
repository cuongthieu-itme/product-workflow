"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetStandardWorkflow } from "@/components/workflow/reset-standard-workflow"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResetWorkflowPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/workflow-management">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Khởi tạo lại quy trình chuẩn</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Khởi tạo lại quy trình chuẩn</CardTitle>
          <CardDescription>
            Trang này cho phép bạn khởi tạo lại quy trình chuẩn với các bước mặc định. Hành động này sẽ xóa quy trình
            chuẩn hiện tại và tạo lại từ đầu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Các bước trong quy trình chuẩn mặc định:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Tiếp nhận yêu cầu</li>
              <li>Checking (Kiểm tra yêu cầu)</li>
              <li>Chuẩn bị nguyên vật liệu</li>
              <li>File sản xuất</li>
              <li>Sản xuất hàng mẫu</li>
              <li>Phản hồi khách hàng</li>
              <li>Template/Mockup</li>
              <li>Cần check</li>
              <li>Tính giá</li>
              <li>Cần up web</li>
            </ol>
          </div>

          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="text-lg font-medium text-amber-800">Lưu ý quan trọng</h3>
            <p className="text-amber-700 mt-2">
              Việc khởi tạo lại quy trình chuẩn sẽ xóa tất cả các thay đổi bạn đã thực hiện với quy trình chuẩn hiện
              tại. Các quy trình con có thể bị ảnh hưởng nếu chúng tham chiếu đến các bước không còn tồn tại trong quy
              trình chuẩn mới.
            </p>
          </div>

          <ResetStandardWorkflow />
        </CardContent>
      </Card>
    </div>
  )
}
