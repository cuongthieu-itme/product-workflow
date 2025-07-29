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
import { RequestStatus, RequestType } from "../type";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { CreateRequestButton } from "./create-request-button";
import { RequestForm } from "../form";
import { useRouter } from "next/navigation";
import { useStatisticsRequestQuery } from "../hooks/useRequest";
import { DeleteRequestDialog } from "./delete-request-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function RequestList() {
  const [page, setPage] = useState(PAGE);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all"
  );
  const debouncedSearch = useDebounce(searchValue, 400);
  const { data } = useStatisticsRequestQuery();
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    request: RequestType | null;
  }>({
    isOpen: false,
    request: null,
  });

  const {
    data: requests,
    isFetching,
    refetch,
  } = useGetRequestsQuery({
    page,
    limit: LIMIT,
    title: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const [openRequestFormEdit, setOpenRequestFormEdit] = useState<{
    isOpen: boolean;
    requestId: number | undefined;
  }>({
    isOpen: false,
    requestId: undefined,
  });

  const totalPages = requests?.total
    ? Math.ceil(requests?.total / LIMIT)
    : PAGE;

  // Reset page to 1 when status filter changes
  const handleStatusChange = (value: string) => {
    if (value === "all") {
      setStatusFilter("all");
      setPage(PAGE);

      return;
    }
    setStatusFilter(value as RequestStatus | "all");
    setPage(PAGE);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const statusConfig = {
      [RequestStatus.PENDING]: {
        label: "Chờ xử lý",
        variant: "secondary" as const,
      },
      [RequestStatus.APPROVED]: {
        label: "Đã xác nhận",
        variant: "default" as const,
      },
      [RequestStatus.IN_PROGRESS]: {
        label: "Đang xử lý",
        variant: "outline" as const,
      },
      [RequestStatus.COMPLETED]: {
        label: "Hoàn thành",
        variant: "default" as const,
      },
      [RequestStatus.REJECTED]: {
        label: "Từ chối",
        variant: "destructive" as const,
      },
    };

    const config = statusConfig[status];
    return (
      <Badge
        variant={config.variant}
        className={`${
          status === RequestStatus.PENDING
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            : status === RequestStatus.APPROVED
            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
            : status === RequestStatus.IN_PROGRESS
            ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
            : status === RequestStatus.COMPLETED
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : ""
        } w-[fit-content]`}
      >
        {config.label}
      </Badge>
    );
  };

  const columns: Column<RequestType>[] = [
    { id: "title", header: "Tên yêu cầu" },
    {
      id: "description",
      header: "Chi tiết yêu cầu",
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (u) => getStatusBadge(u.status),
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
              router.push(`/dashboard/requests/${u.id}`);
            }}
          >
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
          <Button
            variant="outline"
            size="sm"
            disabled={u.status !== RequestStatus.PENDING}
            onClick={() => {
              setDeleteDialogState({
                isOpen: true,
                request: u,
              });
            }}
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
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {data?.data.PENDING || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu chưa được xác nhận
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
                <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {data?.data.APPROVED || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu đã được xác nhận
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
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {data?.data.COMPLETED || 0}
                </p>
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
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {" "}
                  {data?.data.REJECTED || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu đã bị từ chối hoặc tạm dừng
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={handleStatusChange}
        className="space-y-4"
      >
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 min-w-max">
            <TabsTrigger value="all" className="text-xs lg:text-sm">
              Tất cả ({data?.data.ALL || 0})
            </TabsTrigger>
            <TabsTrigger
              value={RequestStatus.PENDING}
              className="text-xs lg:text-sm"
            >
              Chờ xử lý ({data?.data.PENDING || 0})
            </TabsTrigger>
            <TabsTrigger
              value={RequestStatus.APPROVED}
              className="text-xs lg:text-sm"
            >
              Đã xác nhận ({data?.data.APPROVED || 0})
            </TabsTrigger>
            <TabsTrigger
              value={RequestStatus.IN_PROGRESS}
              className="text-xs lg:text-sm"
            >
              Đang xử lý ({data?.data.IN_PROGRESS || 0})
            </TabsTrigger>
            <TabsTrigger
              value={RequestStatus.COMPLETED}
              className="text-xs lg:text-sm"
            >
              Hoàn thành ({data?.data.COMPLETED || 0})
            </TabsTrigger>
            <TabsTrigger
              value={RequestStatus.REJECTED}
              className="text-xs lg:text-sm"
            >
              Từ chối ({data?.data.REJECTED || 0})
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

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
            data={requests?.data || []}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <RequestForm
        isDialogOpen={openRequestFormEdit.isOpen}
        setIsDialogOpen={(open) =>
          setOpenRequestFormEdit({ ...openRequestFormEdit, isOpen: open })
        }
        requestId={openRequestFormEdit.requestId}
      />

      {deleteDialogState.request && (
        <DeleteRequestDialog
          isOpen={deleteDialogState.isOpen}
          onClose={() => {
            setDeleteDialogState({ isOpen: false, request: null });
            refetch(); // Refresh the list after deletion
          }}
          request={deleteDialogState.request}
        />
      )}
    </div>
  );
}
