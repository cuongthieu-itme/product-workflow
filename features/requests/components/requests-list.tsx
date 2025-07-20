"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { useGetRequestsQuery } from "../hooks";
import { RequestType } from "../type";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { CreateRequestButton } from "./create-request-button";

export function RequestList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);
  const {
    data: requests,
    isFetching,
    refetch,
  } = useGetRequestsQuery({
    page,
    limit: LIMIT,
    title: debouncedSearch,
  });

  const totalPages = requests
    ? Math.max(PAGE, Math.ceil(requests.total / LIMIT))
    : PAGE;

  const columns: Column<RequestType>[] = [
    { id: "title", header: "Tên yêu cầu" },
    {
      id: "description",
      header: "Chi tiết yêu cầu",
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
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Chi tiết
          </Button>

          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>
          <Button variant="outline" size="sm">
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
        <h2 className="text-2xl font-bold tracking-tight">Danh sách yêu cầu</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-end">
            <CreateRequestButton />
          </div>

          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
          ></TableToolbar>

          <DataTable<RequestType>
            data={requests?.data}
            columns={columns}
            loading={isFetching}
          />

          {/* <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          /> */}
        </div>
      </Card>
    </div>
  );
}
