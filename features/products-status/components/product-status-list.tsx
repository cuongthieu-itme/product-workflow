"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { ProductStatusType } from "../types";
import { UpdateProductStatusForm } from "./update-product-status-form";
import { DeleteProductStatusDialog } from "./delete-product-status-dialog";
import { useProductsStatusQuery } from "../hooks";
import { CreateProductStatusForm } from "./create-product-status-form";
import { ProductStatusDetail } from "./detail/product-status-detail";
import { useDebounce } from "@/hooks/use-debounce";

export function ProductStatusList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const {
    data: products,
    isLoading,
    refetch,
  } = useProductsStatusQuery({
    page,
    limit: LIMIT,
    name: debouncedSearchValue,
  });
  const [editForm, setEditForm] = useState<ProductStatusType | null>(null);
  const [deleteForm, setDeleteForm] = useState<ProductStatusType | null>(null);
  const [detailStatusId, setDetailStatusId] = useState<number | null>(null);

  const handleOpenDeleteDialog = (customer: ProductStatusType) => {
    setDeleteForm(customer);
  };

  const handleOpenEditDialog = (customer: ProductStatusType) => {
    setEditForm(customer);
  };

  const totalPages = products
    ? Math.max(PAGE, Math.ceil(products.total / LIMIT))
    : PAGE;

  const columns: Column<ProductStatusType>[] = [
    {
      id: "color",
      header: "Màu",
      cell: (u) => (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: u.color || "#4f46e5" }}
        />
      ),
    },
    { id: "name", header: "Tên" },
    {
      id: "description",
      header: "Chi tiết",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailStatusId(u.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Chi tiết
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
            Danh sách trạng thái sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Quản lý thông tin trạng thái sản phẩm
          </p>
        </div>

        <CreateProductStatusForm />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isLoading}
          />

          <DataTable<ProductStatusType>
            data={products?.data}
            columns={columns}
            loading={isLoading}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <UpdateProductStatusForm
              onClose={() => setEditForm(null)}
              product={editForm}
              open={Boolean(editForm)}
            />
          )}

          {deleteForm && (
            <DeleteProductStatusDialog
              deletingProduct={deleteForm}
              setDeletingProduct={setDeleteForm}
            />
          )}

          {detailStatusId && (
            <ProductStatusDetail
              statusId={detailStatusId}
              open={!!detailStatusId}
              onOpenChange={setDetailStatusId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
