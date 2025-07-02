"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductStatusTable } from "@/components/product-status/product-status-table"
import { AddProductStatusForm } from "@/components/product-status/add-product-status-form"
import { ProductStatusProvider } from "@/components/product-status/product-status-context-firebase"
import { StandardWorkflowProvider } from "@/components/workflow/standard-workflow-context-firebase"
import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase"

export default function ProductStatusPage() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <ProductStatusProvider>
      <StandardWorkflowProvider>
        <SubWorkflowProvider>
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý trạng thái sản phẩm</h1>
              <Button onClick={() => setActiveTab("add")}>Thêm trạng thái mới</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Danh sách trạng thái</TabsTrigger>
                <TabsTrigger value="add">Thêm trạng thái mới</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-6">
                <ProductStatusTable />
              </TabsContent>
              <TabsContent value="add" className="mt-6">
                <AddProductStatusForm onSuccess={() => setActiveTab("list")} />
              </TabsContent>
            </Tabs>
          </div>
        </SubWorkflowProvider>
      </StandardWorkflowProvider>
    </ProductStatusProvider>
  )
}
