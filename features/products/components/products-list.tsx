"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { ProductType } from "../types";
import { UpdateProductForm } from "./update-product-form";
import { DeleteProductDialog } from "./delete-product-dialog";
import { useProductsQuery } from "../hooks";
import { CreateProductForm } from "./create-product-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { KEY_EMPTY_SELECT } from "@/components/form/select";
import { useDebounce } from "@/hooks/use-debounce";

export function ProductList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const [categoryId, setCategoryId] = useState<string>(KEY_EMPTY_SELECT);
  const debouncedSearch = useDebounce(searchValue, 400);
  const {
    data: products,
    isFetching,
    refetch,
  } = useProductsQuery({
    page,
    limit: LIMIT,
    name: debouncedSearch,
    categoryId,
  });
  const [editForm, setEditForm] = useState<ProductType | null>(null);
  const [deleteForm, setDeleteForm] = useState<ProductType | null>(null);

  const handleOpenDeleteDialog = (customer: ProductType) => {
    setDeleteForm(customer);
  };

  const handleOpenEditDialog = (customer: ProductType) => {
    setEditForm(customer);
  };

  const totalPages = products
    ? Math.max(PAGE, Math.ceil(products.total / LIMIT))
    : PAGE;

  const columns: Column<ProductType>[] = [
    { id: "name", header: "Tên sản phầm" },
    {
      id: "description",
      header: "Chi tiết sản phẩm",
    },
    {
      id: "category",
      header: "Danh mục sản phẩm",
      cell: (u) => u.category.name,
    },
    {
      id: "createdAt",
      header: "Ngày tạo",
      cell: (u) => format(new Date(u.createdAt), "dd/MM/yyyy hh:mm"),
    },
    {
      id: "updatedAt",
      header: "Ngày cập nhật",
      cell: (u) => format(new Date(u.updatedAt), "dd/MM/yyyy hh:mm"),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right w-1",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${u.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Chi tiết
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditDialog(u)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDeleteDialog(u)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const { data: categories } = useCategoriesQuery({ limit: 10000 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h2>
          <p className="text-muted-foreground">Quản lý thông tin sản phẩm</p>
        </div>

        <CreateProductForm />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
          >
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={KEY_EMPTY_SELECT}>Tất cả danh mục</SelectItem>
                {categories?.data.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableToolbar>

          <DataTable<ProductType>
            data={products?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <UpdateProductForm
              onClose={() => setEditForm(null)}
              product={editForm}
              open={Boolean(editForm)}
            />
          )}

          {deleteForm && (
            <DeleteProductDialog
              deletingProduct={deleteForm}
              setDeletingCustomer={setDeleteForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
