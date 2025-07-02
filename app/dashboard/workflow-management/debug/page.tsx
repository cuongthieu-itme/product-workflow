"use client"

import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase"
import { StandardWorkflowProvider } from "@/components/workflow/standard-workflow-context-firebase"
import { ProductStatusProvider } from "@/components/product-status/product-status-context-firebase"
import { DebugSubWorkflows } from "@/components/workflow/debug-sub-workflows"

export default function DebugPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Debug Quy Trình Con (Collection: subWorkflows)</h1>
      </div>

      <ProductStatusProvider>
        <StandardWorkflowProvider>
          <SubWorkflowProvider>
            <DebugSubWorkflows />
          </SubWorkflowProvider>
        </StandardWorkflowProvider>
      </ProductStatusProvider>
    </div>
  )
}
