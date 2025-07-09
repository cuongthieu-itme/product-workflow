"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye, RefreshCw, AlertCircle } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { useDepartmentsQuery } from "../hooks";
import { DepartmentType } from "../type";
import Link from "next/link";
import { UpdateDepartmentForm } from "./update-department-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { useDebounce } from "@/hooks/use-debounce";

export function DepartmentList() {
  const [page, setPage] = useState(PAGE);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentType | null>(null);
  const [deleteDepartment, setDeleteDepartment] =
    useState<DepartmentType | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  const {
    data: departments,
    isLoading,
    refetch,
  } = useDepartmentsQuery({
    page,
    limit: LIMIT,
    name: debouncedSearch,
  });

  const handleOpenDeleteDialog = (department: DepartmentType) => {
    setDeleteDepartment(department);
  };

  const handleOpenEditDialog = (department: DepartmentType) => {
    setEditingDepartment(department);
  };

  const totalPages = departments
    ? Math.max(PAGE, Math.ceil(departments.total / LIMIT))
    : PAGE;

  const columns: Column<DepartmentType>[] = [
    { id: "name", header: "Tên phòng ban" },
    { id: "description", header: "Mô tả" },
    {
      id: "head",
      header: "Trưởng phòng",
      cell: (d) => d.head?.fullName || "Chưa cập nhật",
    },
    {
      id: "_count",
      header: "Số lượng thành viên",
      cell: (u) => u._count?.members || 0,
    },
    {
      id: "projects",
      header: "Dự án liên quan",
      cell: (d) => "0",
    },

    {
      id: "actions",
      header: <span className="sr-only">Thao tác</span>,
      className: "text-right w-1",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/departments/${u.id}`}>
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
    <div className="space-y-4">
      <TableToolbar
        searchPlaceholder="Tìm kiếm tên phòng ban..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={refetch}
        refreshing={isLoading}
      />

      <DataTable<DepartmentType>
        data={departments?.data}
        columns={columns}
        loading={isLoading}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {editingDepartment && (
        <UpdateDepartmentForm
          onClose={() => setEditingDepartment(null)}
          department={editingDepartment}
          open={Boolean(editingDepartment)}
        />
      )}

      {deleteDepartment && (
        <DeleteDepartmentDialog
          deletingDepartment={deleteDepartment}
          setDeletingDepartment={setDeleteDepartment}
        />
      )}
    </div>
  );
}
