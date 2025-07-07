"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { useDepartmentsQuery } from "../hooks";
import { DepartmentType } from "../type";
import Link from "next/link";
import { UpdateDepartmentForm } from "./update-department-form";

export function DepartmentList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: usersResp, isFetching, refetch } = useDepartmentsQuery();
  const [editingUser, setEditingUser] = useState<DepartmentType | null>(null);
  const [deleteUser, setDeleteUser] = useState<DepartmentType | null>(null);

  const handleOpenDeleteDialog = (department: DepartmentType) => {
    setDeleteUser(department);
  };

  const handleOpenEditDialog = (department: DepartmentType) => {
    setEditingUser(department);
  };

  const totalPages = usersResp
    ? Math.max(1, Math.ceil(usersResp.total / limit))
    : 1;

  const columns: Column<DepartmentType>[] = [
    { id: "name", header: "Tên phòng ban" },
    { id: "description", header: "Mô tả" },
    {
      id: "headId",
      header: "Trưởng phòng",
      // cell: (d) => d.head?.fullName || "Chưa cập nhật",
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
      <DataTable<DepartmentType>
        data={usersResp?.data}
        columns={columns}
        loading={isFetching}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {editingUser && (
        <UpdateDepartmentForm
          onClose={() => setEditingUser(null)}
          department={editingUser}
          open={Boolean(editingUser)}
        />
      )}
    </div>
  );
}
