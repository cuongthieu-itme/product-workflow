import type { Metadata } from "next"
import { ApiDocumentation } from "@/components/api-documentation"
import { ApiExamples } from "@/components/api-examples"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Tài Liệu API - ProductFlow",
  description: "Tài liệu API cho hệ thống quản lý quy trình phát triển sản phẩm",
}

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tài Liệu API</h1>
        <p className="text-muted-foreground">
          Tài liệu API cho hệ thống quản lý quy trình phát triển sản phẩm ProductFlow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giới Thiệu</CardTitle>
          <CardDescription>
            API của ProductFlow cho phép bạn tích hợp với các hệ thống khác và tự động hóa quy trình phát triển sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Xác thực</h3>
              <p className="text-muted-foreground">
                Tất cả các API endpoints đều yêu cầu xác thực bằng JWT token. Token này có thể được lấy thông qua
                endpoint đăng nhập và phải được gửi trong header Authorization dưới dạng Bearer token.
              </p>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-sm">
                Authorization: Bearer {"{your_token_here}"}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium">Định dạng phản hồi</h3>
              <p className="text-muted-foreground">
                Tất cả các API endpoints đều trả về phản hồi dưới dạng JSON với cấu trúc thống nhất. Mỗi phản hồi đều có
                trường success để chỉ ra trạng thái của yêu cầu và trường data hoặc message tùy thuộc vào loại phản hồi.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Xử lý lỗi</h3>
              <p className="text-muted-foreground">
                Khi có lỗi xảy ra, API sẽ trả về mã trạng thái HTTP tương ứng cùng với thông báo lỗi trong phản hồi
                JSON.
              </p>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-sm">
                {`{
  "success": false,
  "message": "Thông báo lỗi chi tiết"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApiDocumentation />
      <ApiExamples />
    </div>
  )
}
