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
import { CategoryType } from "../types";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { useCategoriesQuery } from "../hooks";
import { UpdateCategoryForm } from "./update-category-form";
import { CreateCategoryForm } from "./create-category-form";
import { useDebounce } from "@/hooks/use-debounce";

export function CategoryList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const {
    data: categories,
    refetch,
    isFetching,
  } = useCategoriesQuery({
    name: debouncedSearchValue,
    page,
    limit: LIMIT,
  });
  const [editForm, setEditForm] = useState<CategoryType | null>(null);
  const [deleteForm, setDeleteForm] = useState<CategoryType | null>(null);

  const handleOpenDeleteDialog = (category: CategoryType) => {
    setDeleteForm(category);
  };

  const handleOpenEditDialog = (category: CategoryType) => {
    setEditForm(category);
  };

  const totalPages = categories?.total
    ? Math.ceil(categories.total / LIMIT)
    : 1;

  const columns: Column<CategoryType>[] = [
    { id: "name", header: "Tên danh mục" },
    {
      id: "description",
      header: "Mô tả",
      cell: (u) => u.description || "N/A",
    },
    {
      id: "_count",
      header: "Sản phẩm",
      cell: (u) => u._count.products,
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
            <Link href={`/dashboard/categories/${u.id}`}>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý danh mục sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Quản lý thông tin danh mục sản phẩm trong hệ thống
          </p>
        </div>

        <CreateCategoryForm />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
            searchPlaceholder="Tìm kiếm danh mục..."
          />

          <DataTable<CategoryType>
            data={categories?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <UpdateCategoryForm
              onClose={() => setEditForm(null)}
              category={editForm}
              open={Boolean(editForm)}
            />
          )}

          {deleteForm && (
            <DeleteCategoryDialog
              deletingProduct={deleteForm}
              setDeletingCustomer={setDeleteForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
