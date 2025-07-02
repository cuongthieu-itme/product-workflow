import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RDRequestsList } from "@/components/rd/rd-requests-list"
import { RDRequestFilters } from "@/components/rd/rd-request-filters"
import { RDStats } from "@/components/rd/rd-stats"

export const metadata: Metadata = {
  title: "Quản lý R&D - Hệ thống quản lý yêu cầu",
  description: "Quản lý yêu cầu phát triển sản phẩm của phòng R&D",
}

export default function RDManagementPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý R&D</h1>
        <p className="text-muted-foreground">Quản lý và phân loại yêu cầu phát triển sản phẩm của phòng R&D</p>
      </div>

      <RDStats />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
          <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="denied">Từ chối/Tạm hoãn</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu chờ xử lý</CardTitle>
              <CardDescription>Danh sách các yêu cầu đang chờ phân loại và xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              <RDRequestFilters />
              <div className="mt-4">
                <RDRequestsList status="pending" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đang xử lý</CardTitle>
              <CardDescription>Danh sách các yêu cầu đang được xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              <RDRequestFilters />
              <div className="mt-4">
                <RDRequestsList status="processing" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đã hoàn thành</CardTitle>
              <CardDescription>Danh sách các yêu cầu đã được xử lý hoàn thành</CardDescription>
            </CardHeader>
            <CardContent>
              <RDRequestFilters />
              <div className="mt-4">
                <RDRequestsList status="completed" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="denied" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu từ chối/tạm hoãn</CardTitle>
              <CardDescription>Danh sách các yêu cầu đã bị từ chối hoặc tạm hoãn</CardDescription>
            </CardHeader>
            <CardContent>
              <RDRequestFilters />
              <div className="mt-4">
                <RDRequestsList status="denied" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
