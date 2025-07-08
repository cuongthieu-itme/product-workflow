"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerRequests } from "@/components/customers/customer-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerInformation } from "./customer-information";
import { useCustomerQuery } from "../../hooks";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CustomerDetail() {
  const params = useParams();
  const customerId = params.id as string;
  const { data: customer, isLoading, refetch } = useCustomerQuery(customerId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Không tìm thấy khách hàng
              </h2>
              <p className="text-gray-500 mt-2">
                Khách hàng không tồn tại hoặc đã bị xóa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/custom ers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">
          Chi tiết khách hàng: {customer.data.fullName}
        </h1>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4">
            <CustomerInformation customerId={customerId} />
          </TabsContent>
          <TabsContent value="requests" className="mt-4">
            <CustomerRequests customerId={customerId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
