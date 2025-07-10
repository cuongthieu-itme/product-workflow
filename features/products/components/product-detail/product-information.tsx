"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Pencil, Info, Folder, Tag, Calendar } from "lucide-react";
import { useProductQuery } from "../../hooks";
import { UpdateProductForm } from "../update-product-form";

interface ProductInformationProps {
  productId: string;
}

export function ProductInformation({ productId }: ProductInformationProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: product, isLoading } = useProductQuery(productId);

  if (isLoading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  if (!product?.data) {
    return (
      <div className="text-center py-4">Không tìm thấy thông tin sản phẩm</div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thông tin sản phẩm</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Tag className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Tên sản phẩm</p>
              <p className="font-medium">
                {product.data.name}
              </p>
            </div>
          </div>


          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Chi tiết</p>
              <p className="font-medium">
                {product.data.description || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Folder className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Danh mục</p>
              <p className="font-medium flex items-center">
                {product.data.category ? (
                  <>
                    {product.data.category.name}
                  </>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-start gap-3">
            <Calendar className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="text-sm">{format(product.data.createdAt, "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
          {product.data.updatedAt &&
            product.data.updatedAt !== product.data.createdAt && (
              <div className="flex items-start gap-3 mt-2">
                <Calendar className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="font-medium">
                  {format(product.data.updatedAt, "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            )}
        </div>
      </CardContent>

      <UpdateProductForm
        product={product.data}
        onClose={() => setShowEditDialog(false)}
        onCustomerAdded={() => setShowEditDialog(false)}
        open={showEditDialog}
      />
    </Card>
  );
}
