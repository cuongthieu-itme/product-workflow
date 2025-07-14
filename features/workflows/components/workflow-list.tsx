"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye, PlusCircle } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { WorkFlowProcessType } from "../types";
import { useWorkFlowProcessesQuery } from "../hooks";
import { useRouter } from "next/navigation";
import { DeleteWorkflowDialog } from "./delete-workflow-dialog";
import { useDebounce } from "@/hooks/use-debounce";

export function WorkflowProcessList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const [deleteWorkflow, setDeleteWorkflow] =
    useState<WorkFlowProcessType | null>(null);
  const searchValueDebounced = useDebounce(searchValue, 400);
  const {
    data: products,
    isFetching,
    refetch,
  } = useWorkFlowProcessesQuery({
    page,
    limit: LIMIT,
    name: searchValueDebounced,
  });

  const totalPages = products
    ? Math.max(PAGE, Math.ceil(products.total / LIMIT))
    : PAGE;

  const handleOpenDeleteDialog = (workflow: WorkFlowProcessType) => {
    setDeleteWorkflow(workflow);
  };

  const columns: Column<WorkFlowProcessType>[] = [
    {
      className: "min-w-5",
      id: "name",
      header: "Tên quy trình",
    },
    {
      className: "min-w-5",
      id: "description",
      header: "Chi tiết quy trình",
    },
    {
      className: "min-w-5",
      id: "createdAt",
      header: "Ngày tạo",
      cell: (u) => format(new Date(u.createdAt), "dd/MM/yyyy hh:mm"),
    },
    {
      className: "min-w-5",
      id: "updatedAt",
      header: "Ngày cập nhật",
      cell: (u) => format(new Date(u.updatedAt), "dd/MM/yyyy hh:mm"),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right min-w-5",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/workflows/${u.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Chi tiết
            </Link>
          </Button>

          <Button variant="outline" size="sm">
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

  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý quy trình
          </h2>
          <p className="text-muted-foreground">
            Thiết lập và quản lý quy trình chuẩn và quy trình con cho các trạng
            thái sản phẩm khác nhau.
          </p>
        </div>

        <Button
          className="w-full md:w-auto"
          onClick={() => router.push("/dashboard/workflows/create")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo quy trình
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
          />

          <DataTable<WorkFlowProcessType>
            data={products?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {deleteWorkflow && (
            <DeleteWorkflowDialog
              deletingWorkflow={deleteWorkflow}
              setDeletingWorkflow={setDeleteWorkflow}
            />
          )}
        </div>
      </div>
    </div>
  );
}
