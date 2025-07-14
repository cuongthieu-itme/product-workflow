"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Pencil, Tag, Info, Calendar, Clock, Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useCategoryQuery } from "../../hooks";
import { UpdateCategoryForm } from "../update-category-form";
import Link from "next/link";

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
    <div className="space-y-6">
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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Tag className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Tên danh mục</p>
              <p className="font-medium">{category.data.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Chi tiết</p>
              <p className="font-medium">
                {category.data.description || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="text-sm">
                {format(category.data.createdAt, "dd/MM/yyyy HH:mm")}
              </p>
            </div>
          </div>

          {category.data.updatedAt &&
            category.data.updatedAt !== category.data.createdAt && (
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm">
                    {format(category.data.updatedAt, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            )}
        </CardContent>

        <UpdateCategoryForm
          category={category.data}
          onClose={() => setShowEditDialog(false)}
          onCategoryAdded={() => setShowEditDialog(false)}
          open={showEditDialog}
        />
      </Card>
      <Card>
        <CardContent>
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Sản phẩm thuộc danh mục</h3>
            {category?.data.products?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Chi tiết</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category?.data.products.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.description || "N/A"}</TableCell>
                      <TableCell>
                        {format(p.createdAt, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {format(p.updatedAt, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Link
                            href={`/dashboard/products/${p.id}`}
                            className="flex items-center gap-1"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Chi tiết
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có sản phẩm nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
