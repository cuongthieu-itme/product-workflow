"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import {
  Edit,
  Trash2,
  Eye,
  User,
  Settings,
  FileText,
  BarChart3,
  Calendar,
} from "lucide-react";
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
import { RequestForm } from "../form";

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
  const [openRequestFormEdit, setOpenRequestFormEdit] = useState<{
    isOpen: boolean;
    requestId: number | undefined;
  }>({
    isOpen: false,
    requestId: undefined,
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpenRequestFormEdit({
                isOpen: true,
                requestId: u.id,
              });
            }}
          >
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

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-semibold text-gray-700">
            Thống kê theo trạng thái
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chờ xử lý */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu chưa được xử lý
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Đang xử lý */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu đang được thực hiện
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Hoàn thành */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu đã hoàn thành
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Từ chối/Tạm dừng */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Từ chối/Tạm dừng
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">
                  0 từ chối, 0 tạm dừng
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
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

      <RequestForm
        isDialogOpen={openRequestFormEdit.isOpen}
        setIsDialogOpen={(open) =>
          setOpenRequestFormEdit({ ...openRequestFormEdit, isOpen: open })
        }
        requestId={openRequestFormEdit.requestId}
      />
    </div>
  );
}
