"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"

export function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          name: "Login",
          method: "POST",
          endpoint: "/api/auth/signin",
          description: "Đăng nhập và lấy token xác thực",
          request: `{
  "email": "user@example.com",
  "password": "password123"
}`,
          response: `{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "department": "product"
    },
    "token": "jwt_token_here"
  }
}`,
        },
        {
          name: "Logout",
          method: "POST",
          endpoint: "/api/auth/signout",
          description: "Đăng xuất và hủy token hiện tại",
          request: `{}`,
          response: `{
  "success": true,
  "message": "Logged out successfully"
}`,
        },
      ],
    },
    {
      category: "Products",
      items: [
        {
          name: "Get Products",
          method: "GET",
          endpoint: "/api/products",
          description: "Lấy danh sách sản phẩm với các tùy chọn lọc",
          request: "Query params: status, department, page, limit",
          response: `{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Ghế Ergonomic Pro",
      "description": "Ghế văn phòng cao cấp với thiết kế ergonomic",
      "status": "design",
      "currentStep": 2,
      "createdAt": "2023-04-15T00:00:00.000Z",
      "updatedAt": "2023-04-20T00:00:00.000Z",
      "departments": ["product", "design"],
      "sku": "GEP-1234"
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}`,
        },
        {
          name: "Create Product",
          method: "POST",
          endpoint: "/api/products",
          description: "Tạo sản phẩm mới",
          request: `{
  "name": "Tên Sản Phẩm",
  "description": "Mô tả sản phẩm",
  "status": "draft",
  "departments": ["product", "design"]
}`,
          response: `{
  "success": true,
  "data": {
    "id": "123",
    "name": "Tên Sản Phẩm",
    "description": "Mô tả sản phẩm",
    "status": "draft",
    "currentStep": 0,
    "createdAt": "2023-07-01T00:00:00.000Z",
    "updatedAt": "2023-07-01T00:00:00.000Z",
    "departments": ["product", "design"],
    "sku": ""
  }
}`,
        },
        {
          name: "Get Product",
          method: "GET",
          endpoint: "/api/products/{id}",
          description: "Lấy thông tin chi tiết của sản phẩm",
          request: "Path param: id",
          response: `{
  "success": true,
  "data": {
    "id": "1",
    "name": "Ghế Ergonomic Pro",
    "description": "Ghế văn phòng cao cấp với thiết kế ergonomic",
    "status": "design",
    "currentStep": 2,
    "createdAt": "2023-04-15T00:00:00.000Z",
    "updatedAt": "2023-04-20T00:00:00.000Z",
    "departments": ["product", "design"],
    "sku": "GEP-1234"
  }
}`,
        },
        {
          name: "Update Product",
          method: "PUT",
          endpoint: "/api/products/{id}",
          description: "Cập nhật thông tin sản phẩm",
          request: `{
  "name": "Tên Sản Phẩm Mới",
  "description": "Mô tả sản phẩm mới",
  "status": "review"
}`,
          response: `{
  "success": true,
  "data": {
    "id": "1",
    "name": "Tên Sản Phẩm Mới",
    "description": "Mô tả sản phẩm mới",
    "status": "review",
    "currentStep": 2,
    "createdAt": "2023-04-15T00:00:00.000Z",
    "updatedAt": "2023-07-01T00:00:00.000Z",
    "departments": ["product", "design"],
    "sku": "GEP-1234"
  }
}`,
        },
        {
          name: "Delete Product",
          method: "DELETE",
          endpoint: "/api/products/{id}",
          description: "Xóa sản phẩm",
          request: "Path param: id",
          response: `{
  "success": true,
  "message": "Product deleted successfully"
}`,
        },
      ],
    },
    {
      category: "Product Steps",
      items: [
        {
          name: "Get Product Steps",
          method: "GET",
          endpoint: "/api/products/{id}/steps",
          description: "Lấy danh sách các bước trong quy trình của sản phẩm",
          request: "Path param: id",
          response: `{
  "success": true,
  "data": [
    {
      "id": "step1",
      "name": "Khởi Tạo Yêu Cầu",
      "status": "completed",
      "completedAt": "2023-04-16T00:00:00.000Z"
    },
    {
      "id": "step2",
      "name": "Kiểm Tra Phát Triển",
      "status": "completed",
      "completedAt": "2023-04-18T00:00:00.000Z"
    },
    {
      "id": "step3",
      "name": "Thiết Kế & Xác Nhận",
      "status": "in_progress",
      "startedAt": "2023-04-19T00:00:00.000Z"
    }
  ]
}`,
        },
        {
          name: "Update Product Step",
          method: "POST",
          endpoint: "/api/products/{id}/steps",
          description: "Cập nhật trạng thái của bước trong quy trình",
          request: `{
  "stepId": "step3",
  "status": "completed"
}`,
          response: `{
  "success": true,
  "data": {
    "step": {
      "id": "step3",
      "name": "Thiết Kế & Xác Nhận",
      "status": "completed",
      "startedAt": "2023-04-19T00:00:00.000Z",
      "completedAt": "2023-07-01T00:00:00.000Z"
    },
    "product": {
      "id": "1",
      "name": "Ghế Ergonomic Pro",
      "status": "production",
      "currentStep": 3,
      ...
    }
  }
}`,
        },
      ],
    },
    {
      category: "Notifications",
      items: [
        {
          name: "Get Notifications",
          method: "GET",
          endpoint: "/api/notifications",
          description: "Lấy danh sách thông báo",
          request: "Query params: read, productId, page, limit",
          response: `{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Yêu cầu phê duyệt thiết kế",
      "message": "Sản phẩm 'Ghế Ergonomic Pro' cần được phê duyệt thiết kế",
      "date": "2023-04-20T00:00:00.000Z",
      "read": false,
      "productId": "1",
      "departments": ["design"]
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}`,
        },
        {
          name: "Create Notification",
          method: "POST",
          endpoint: "/api/notifications",
          description: "Tạo thông báo mới",
          request: `{
  "title": "Thông báo mới",
  "message": "Nội dung thông báo",
  "productId": "1",
  "departments": ["product", "design"]
}`,
          response: `{
  "success": true,
  "data": {
    "id": "4",
    "title": "Thông báo mới",
    "message": "Nội dung thông báo",
    "date": "2023-07-01T00:00:00.000Z",
    "read": false,
    "productId": "1",
    "departments": ["product", "design"]
  }
}`,
        },
        {
          name: "Mark Notification as Read",
          method: "PATCH",
          endpoint: "/api/notifications/{id}",
          description: "Đánh dấu thông báo đã đọc",
          request: `{
  "read": true
}`,
          response: `{
  "success": true,
  "data": {
    "id": "1",
    "title": "Yêu cầu phê duyệt thiết kế",
    "message": "Sản phẩm 'Ghế Ergonomic Pro' cần được phê duyệt thiết kế",
    "date": "2023-04-20T00:00:00.000Z",
    "read": true,
    "productId": "1",
    "departments": ["design"]
  }
}`,
        },
      ],
    },
    {
      category: "Reports",
      items: [
        {
          name: "Get Reports",
          method: "GET",
          endpoint: "/api/reports",
          description: "Lấy danh sách báo cáo",
          request: "Query params: type, page, limit",
          response: `{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Báo cáo tiến độ phát triển sản phẩm Q2/2023",
      "type": "product",
      "createdAt": "2023-06-30T00:00:00.000Z",
      "createdBy": "1",
      "data": {
        "totalProducts": 24,
        "newProducts": 8,
        "inDevelopment": 12,
        "launched": 4,
        ...
      }
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}`,
        },
        {
          name: "Create Report",
          method: "POST",
          endpoint: "/api/reports",
          description: "Tạo báo cáo mới",
          request: `{
  "title": "Báo cáo mới",
  "type": "product",
  "data": {
    "totalProducts": 30,
    "newProducts": 10,
    ...
  }
}`,
          response: `{
  "success": true,
  "data": {
    "id": "4",
    "title": "Báo cáo mới",
    "type": "product",
    "createdAt": "2023-07-01T00:00:00.000Z",
    "createdBy": "1",
    "data": {
      "totalProducts": 30,
      "newProducts": 10,
      ...
    }
  }
}`,
        },
      ],
    },
    {
      category: "Departments",
      items: [
        {
          name: "Get Departments",
          method: "GET",
          endpoint: "/api/departments",
          description: "Lấy danh sách phòng ban",
          request: "",
          response: `{
  "success": true,
  "data": [
    {
      "id": "product",
      "name": "Phòng Sản Phẩm",
      "description": "Quản lý và phát triển sản phẩm",
      "manager": "1",
      "members": ["1", "4", "7"],
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    ...
  ]
}`,
        },
        {
          name: "Create Department",
          method: "POST",
          endpoint: "/api/departments",
          description: "Tạo phòng ban mới (chỉ admin)",
          request: `{
  "id": "research",
  "name": "Phòng Nghiên Cứu",
  "description": "Nghiên cứu và phát triển công nghệ mới",
  "manager": "16",
  "members": ["16", "17", "18"]
}`,
          response: `{
  "success": true,
  "data": {
    "id": "research",
    "name": "Phòng Nghiên Cứu",
    "description": "Nghiên cứu và phát triển công nghệ mới",
    "manager": "16",
    "members": ["16", "17", "18"],
    "createdAt": "2023-07-01T00:00:00.000Z"
  }
}`,
        },
      ],
    },
  ]

  return (
    <Tabs defaultValue="Authentication" className="w-full">
      <TabsList className="mb-4 flex h-auto flex-wrap">
        {endpoints.map((category) => (
          <TabsTrigger key={category.category} value={category.category}>
            {category.category}
          </TabsTrigger>
        ))}
      </TabsList>
      {endpoints.map((category) => (
        <TabsContent key={category.category} value={category.category} className="space-y-4">
          {category.items.map((endpoint) => (
            <Card key={endpoint.endpoint}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-semibold text-white ${
                          endpoint.method === "GET"
                            ? "bg-blue-500"
                            : endpoint.method === "POST"
                              ? "bg-green-500"
                              : endpoint.method === "PUT"
                                ? "bg-yellow-500"
                                : endpoint.method === "PATCH"
                                  ? "bg-purple-500"
                                  : "bg-red-500"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      {endpoint.name}
                    </CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">{endpoint.endpoint}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(endpoint.endpoint, endpoint.endpoint)}
                    >
                      {copiedEndpoint === endpoint.endpoint ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Request</h4>
                    <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">{endpoint.request}</pre>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Response</h4>
                    <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">{endpoint.response}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
