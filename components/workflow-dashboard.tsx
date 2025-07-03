'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import WorkflowSteps from '@/components/workflow-steps'
import ProductList from '@/components/product-list'
import { WorkflowProvider } from '@/components/workflow-context'

export default function WorkflowDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)

  return (
    <WorkflowProvider>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quy Trình Phát Triển Sản Phẩm
            </h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi quy trình phát triển sản phẩm từ khởi tạo đến
              ra mắt
            </p>
          </div>
          <Button onClick={() => setShowNewWorkflow(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Tạo Quy Trình Mới
          </Button>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="active">Đang Thực Hiện</TabsTrigger>
            <TabsTrigger value="completed">Đã Hoàn Thành</TabsTrigger>
            <TabsTrigger value="reports">Báo Cáo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng Số Sản Phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +2 sản phẩm mới trong tháng này
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đang Phát Triển
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    3 sản phẩm đang ở giai đoạn thiết kế
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sắp Ra Mắt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Dự kiến ra mắt trong 30 ngày tới
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cần Xử Lý
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground text-red-500">
                    Cần phê duyệt hoặc bổ sung thông tin
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sản Phẩm Gần Đây</CardTitle>
                <CardDescription>
                  Danh sách các sản phẩm đang trong quy trình phát triển
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sản Phẩm Đang Thực Hiện</CardTitle>
                <CardDescription>
                  Danh sách các sản phẩm đang trong quá trình phát triển
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList filterStatus="active" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sản Phẩm Đã Hoàn Thành</CardTitle>
                <CardDescription>
                  Danh sách các sản phẩm đã hoàn thành quy trình và ra mắt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList filterStatus="completed" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Báo Cáo & Thống Kê</CardTitle>
                <CardDescription>
                  Thống kê và phân tích về quy trình phát triển sản phẩm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  Tính năng báo cáo đang được phát triển
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showNewWorkflow && (
          <WorkflowSteps
            onClose={() => setShowNewWorkflow(false)}
            onComplete={() => {
              setShowNewWorkflow(false)
              setActiveTab('active')
            }}
          />
        )}
      </div>
    </WorkflowProvider>
  )
}
