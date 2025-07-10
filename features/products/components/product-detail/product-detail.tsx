"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductQuery } from "../../hooks";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductInformation } from "./product-information";

export function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading } = useProductQuery(productId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!product?.data) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm</h2>
              <p className="text-gray-500 mt-2">
                Sản phẩm không tồn tại hoặc đã bị xóa
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
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
      <div className="container  space-y-6">
        <h1 className="text-2xl font-bold">
          Chi tiết sản phẩm: {product.data.name}
        </h1>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            {/* <TabsTrigger value="requests">Yêu cầu</TabsTrigger> */}
          </TabsList>
          <TabsContent value="info" className="mt-4">
            <ProductInformation productId={productId} />
          </TabsContent>
          {/* <TabsContent value="requests" className="mt-4">
            <CustomerRequests customerId={customerId} />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
