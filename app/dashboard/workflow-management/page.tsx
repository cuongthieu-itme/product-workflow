"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StandardWorkflowProvider } from "@/components/workflow/standard-workflow-context-firebase"
import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase"
import { SubWorkflowList } from "@/components/workflow/sub-workflow-list"
import { WorkflowEditor } from "./workflow-editor"
// Sửa import để sử dụng đúng context
import { ProductStatusProvider } from "@/components/product-status/product-status-context-firebase"
import { UserContextProvider } from "@/components/workflow/user-context-provider"
import { AvailableVariablesProvider } from "@/components/variables/available-variables-context"

export default function WorkflowManagementPage() {
  const [activeTab, setActiveTab] = useState("standard")

  return (
    <AvailableVariablesProvider>
      <UserContextProvider>
        <ProductStatusProvider>
          <StandardWorkflowProvider>
            <SubWorkflowProvider>
              <div className="container mx-auto py-6 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Quản lý quy trình</h1>
                  <p className="text-muted-foreground">
                    Thiết lập và quản lý quy trình chuẩn và quy trình con cho các trạng thái sản phẩm khác nhau.
                  </p>
                </div>

                <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">Quy trình chuẩn</TabsTrigger>
                    <TabsTrigger value="sub-workflows">Quy trình con</TabsTrigger>
                  </TabsList>
                  <TabsContent value="standard" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quy trình chuẩn</CardTitle>
                        <CardDescription>
                          Thiết lập quy trình chuẩn cho tất cả sản phẩm. Quy trình chuẩn sẽ được sử dụng làm cơ sở cho
                          các quy trình con.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WorkflowEditor />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="sub-workflows" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quy trình con</CardTitle>
                        <CardDescription>
                          Quản lý các quy trình con cho từng trạng thái sản phẩm cụ thể. Quy trình con được tạo dựa trên
                          quy trình chuẩn.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SubWorkflowList parentWorkflowId="standard-workflow" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </SubWorkflowProvider>
          </StandardWorkflowProvider>
        </ProductStatusProvider>
      </UserContextProvider>
    </AvailableVariablesProvider>
  )
}
