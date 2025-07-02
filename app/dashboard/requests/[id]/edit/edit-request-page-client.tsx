"use client"

import { useState } from "react"
import { RequestForm } from "@/components/requests/request-form"
import { RequestProvider } from "@/components/requests/request-context"
import { WorkflowProcessProvider } from "@/components/workflow/workflow-process-context"
import { ProductStatusProvider } from "@/components/product-status/product-status-context"
import { MaterialProvider } from "@/components/materials/material-context"
import { WorkflowProvider } from "@/components/workflow-context"
import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function EditRequestPageClient({ id }: { id: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <WorkflowProvider>
      <ProductStatusProvider>
        <SubWorkflowProvider>
          <WorkflowProcessProvider>
            <MaterialProvider>
              <RequestProvider>
                <div className="container mx-auto py-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa yêu cầu</h1>
                      <p className="text-muted-foreground">Cập nhật thông tin yêu cầu phát triển sản phẩm</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/dashboard/requests/${id}`)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại chi tiết
                    </Button>
                  </div>

                  {error ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Lỗi</CardTitle>
                        <CardDescription>Không thể chỉnh sửa yêu cầu</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{error}</p>
                        <Button className="mt-4" onClick={() => setError(null)}>
                          Thử lại
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <RequestForm requestId={id} />
                  )}
                </div>
              </RequestProvider>
            </MaterialProvider>
          </WorkflowProcessProvider>
        </SubWorkflowProvider>
      </ProductStatusProvider>
    </WorkflowProvider>
  )
}
