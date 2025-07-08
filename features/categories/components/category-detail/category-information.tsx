"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Pencil, Phone } from "lucide-react";
import { useCategoryQuery } from "../../hooks";
import { UpdateCategoryForm } from "../update-category-form";

interface CategoryInformationProps {
  categoryId: string;
}

export function CategoryInformation({ categoryId }: CategoryInformationProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: category, isLoading } = useCategoryQuery(categoryId);

  if (isLoading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  if (!category?.data) {
    return (
      <div className="text-center py-4">Không tìm thấy thông tin danh mục</div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thông tin danh mục</CardTitle>
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
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tên danh mục</p>
            <p className="font-medium">{category.data.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Chi tiết</p>
            <p className="font-medium flex items-center">
              {category.data.description ? (
                <>
                  <Phone className="mr-1 h-4 w-4" />
                  {category.data.description}
                </>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="text-sm">
              {format(category.data.createdAt, "dd/MM/yyyy")}
            </p>
          </div>
          {category.data.updatedAt &&
            category.data.updatedAt !== category.data.createdAt && (
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="text-sm">
                  {format(category.data.updatedAt, "dd/MM/yyyy")}
                </p>
              </div>
            )}
        </div>
      </CardContent>

      <UpdateCategoryForm
        category={category.data}
        onClose={() => setShowEditDialog(false)}
        onCategoryAdded={() => setShowEditDialog(false)}
        open={showEditDialog}
      />
    </Card>
  );
}
