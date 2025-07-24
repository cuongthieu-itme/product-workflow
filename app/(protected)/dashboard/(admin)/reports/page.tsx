import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsList } from "@/components/reports/reports-list";
import { ReportFilters } from "@/components/reports/report-filters";
import { Button } from "@/components/ui/button";
import { Download, FileText, PlusCircle } from "lucide-react";
import { ProductPerformanceChart } from "@/components/reports/product-performance-chart";
import { MarketingPerformanceChart } from "@/components/reports/marketing-performance-chart";

export const metadata: Metadata = {
  title: "Báo Cáo - ProductFlow",
  description: "Xem và tạo báo cáo về quy trình phát triển sản phẩm",
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo Cáo</h1>
          <p className="text-muted-foreground">
            Xem và tạo báo cáo về quy trình phát triển sản phẩm
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Báo Cáo
          </Button>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Tạo Báo Cáo Mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất Cả Báo Cáo</TabsTrigger>
          <TabsTrigger value="product">Báo Cáo Sản Phẩm</TabsTrigger>
          <TabsTrigger value="marketing">Báo Cáo Marketing</TabsTrigger>
          <TabsTrigger value="custom">Báo Cáo Tùy Chỉnh</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <ReportFilters />
          <ReportsList />
        </TabsContent>
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hiệu Suất Sản Phẩm</CardTitle>
                <CardDescription>
                  Phân tích hiệu suất sản phẩm trong 6 tháng qua
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Xuất PDF
              </Button>
            </CardHeader>
            <CardContent>
              <ProductPerformanceChart />
            </CardContent>
          </Card>
          <ReportsList />
        </TabsContent>
        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hiệu Suất Marketing</CardTitle>
                <CardDescription>
                  Phân tích hiệu suất chiến dịch marketing trong 6 tháng qua
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Xuất PDF
              </Button>
            </CardHeader>
            <CardContent>
              <MarketingPerformanceChart />
            </CardContent>
          </Card>
          <ReportsList />
        </TabsContent>
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo Cáo Tùy Chỉnh</CardTitle>
              <CardDescription>
                Tạo báo cáo tùy chỉnh theo nhu cầu của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Đang phát triển tính năng báo cáo tùy chỉnh...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
