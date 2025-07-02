import { WorkflowProcessProvider } from "@/components/workflow/workflow-process-context"
import { ProductStatusProvider } from "@/components/product-status/product-status-context"
import { WorkflowProcessList } from "@/components/workflow/workflow-process-list"

export default function WorkflowPage() {
  return (
    <ProductStatusProvider>
      <WorkflowProcessProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý luồng quy trình làm việc</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý các luồng quy trình làm việc cho từng trạng thái sản phẩm
            </p>
          </div>
          <WorkflowProcessList />
        </div>
      </WorkflowProcessProvider>
    </ProductStatusProvider>
  )
}
