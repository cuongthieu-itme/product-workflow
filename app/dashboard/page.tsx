import type { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from '@/components/dashboard/overview'
import { RecentRequests } from '@/components/dashboard/recent-requests'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DepartmentActivity } from '@/components/dashboard/department-activity'
import { ActivityHistory } from '@/components/dashboard/activity-history'

export const metadata: Metadata = {
  title: 'Dashboard - Hệ thống quản lý yêu cầu',
  description: 'Tổng quan về hệ thống quản lý yêu cầu phát triển sản phẩm'
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Tổng quan về hệ thống quản lý yêu cầu phát triển sản phẩm
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 min-w-max">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs lg:text-sm">
              Phân tích
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs lg:text-sm">
              Báo cáo
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs lg:text-sm">
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs lg:text-sm">
              Lịch sử
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <DashboardStats />

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg lg:text-xl">
                  Trạng thái yêu cầu
                </CardTitle>
                <CardDescription className="text-sm">
                  Phân bố yêu cầu theo trạng thái trong 30 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg lg:text-xl">
                  Hoạt động phòng ban
                </CardTitle>
                <CardDescription className="text-sm">
                  Hoạt động của các phòng ban trong tuần qua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentActivity />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg lg:text-xl">
                Yêu cầu gần đây
              </CardTitle>
              <CardDescription className="text-sm">
                Danh sách các yêu cầu gần đây trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentRequests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Phân tích</CardTitle>
              <CardDescription className="text-sm">
                Phân tích chi tiết về các yêu cầu và tiến độ xử lý
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] lg:h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm lg:text-base">
                Đang phát triển tính năng phân tích...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Báo cáo</CardTitle>
              <CardDescription className="text-sm">
                Các báo cáo về tiến độ xử lý yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] lg:h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm lg:text-base">
                Đang phát triển tính năng báo cáo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Thông báo</CardTitle>
              <CardDescription className="text-sm">
                Các thông báo gần đây về yêu cầu và tiến độ
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] lg:h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm lg:text-base">
                Đang phát triển tính năng thông báo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Lịch sử hoạt động
              </CardTitle>
              <CardDescription className="text-sm">
                Theo dõi ai đang làm gì và đã hoàn thành những phần nào
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
