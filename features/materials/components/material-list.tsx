"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye, Power } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { MaterialType } from "../type";
import Image from "next/image";
import { CreateMaterialForm, MaterialForm } from "./material-form-dialog";
import { useMaterialsQuery } from "../hooks";
import { ToggleStatusMaterialDialog } from "./toggle-status-material-dialog";
import { Badge } from "@/components/ui/badge";

export function MaterialList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const {
    data: materials,
    isFetching,
    refetch,
  } = useMaterialsQuery({
    page,
    limit: LIMIT,
    name: searchValue,
  });
  const [editForm, setEditForm] = useState<MaterialType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [toggleStatusForm, setToggleStatusForm] = useState<MaterialType | null>(
    null
  );

  const handleOpenChangeStatusDialog = (customer: MaterialType) => {
    setToggleStatusForm(customer);
  };

  const handleOpenEditDialog = (customer: MaterialType) => {
    setEditForm(customer);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditForm(null);
    setIsEditDialogOpen(false);
  };

  const totalPages = materials
    ? Math.max(PAGE, Math.ceil(materials.total / LIMIT))
    : PAGE;

  const columns: Column<MaterialType>[] = [
    {
      id: "image",
      header: "Hình ảnh",
      cell: (u) => (
        <Image
          src={u.image[0]}
          alt={u.name}
          width={50}
          height={50}
          className="rounded-sm"
        />
      ),
    },
    { id: "name", header: "Tên nguyên liệu" },
    {
      id: "code",
      header: "Mã nguyên liệu",
    },
    {
      id: "count",
      header: "Số lượng",
      cell: (u) => u.count,
    },
    {
      id: "unit",
      header: "Đơn vị",
      cell: (u) => u.unit,
    },
    {
      id: "origin",
      header: "Xuất xứ",
      cell: (u) => u.origin,
    },
    {
      id: "isActive",
      header: "Trạng thái",
      cell: (u) => (
        <Badge
          variant={u.isActive ? "default" : "destructive"}
          className="text-xs"
        >
          {u.isActive ? "Còn hàng" : "Hết hàng"}
        </Badge>
      ),
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
            onClick={() => {
              handleOpenEditDialog(u);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChangeStatusDialog(u)}
          >
            <Power className="h-4 w-4" />
            Thay đổi trạng thái
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
            Quản lý nguyên liệu
          </h2>
          <p className="text-muted-foreground">Quản lý thông tin nguyên liệu</p>
        </div>

        <CreateMaterialForm />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
          />

          <DataTable<MaterialType>
            data={materials?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <MaterialForm
              material={editForm}
              isDialogOpen={isEditDialogOpen}
              onClose={handleCloseEditDialog}
            />
          )}

          {toggleStatusForm && (
            <ToggleStatusMaterialDialog
              changeStatusMaterial={toggleStatusForm}
              setChangeStatusMaterial={setToggleStatusForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
