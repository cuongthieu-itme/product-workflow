"use client"

import { RequestForm } from "@/components/requests/request-form"
import { RequestProvider } from "@/components/requests/request-context"
import { WorkflowProcessProvider } from "@/components/workflow/workflow-process-context"
import { ProductStatusProvider } from "@/components/product-status/product-status-context"
import { MaterialProvider } from "@/components/materials/material-context"
import { WorkflowProvider } from "@/components/workflow-context"
import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewRequestPageClient() {
  const router = useRouter()

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
                      <h1 className="text-3xl font-bold tracking-tight">Tạo yêu cầu mới</h1>
                      <p className="text-muted-foreground">Tạo yêu cầu phát triển sản phẩm mới</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/dashboard/requests")}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                    </Button>
                  </div>

                  <RequestForm />
                </div>
              </RequestProvider>
            </MaterialProvider>
          </WorkflowProcessProvider>
        </SubWorkflowProvider>
      </ProductStatusProvider>
    </WorkflowProvider>
  )
}
