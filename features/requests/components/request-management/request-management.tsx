"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Eye, CheckCircle } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { useGetRequestsQuery } from "../../hooks";
import { RequestStatus, RequestType } from "../../type";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { BaseDialog } from "@/components/dialog";
import { TablePagination } from "@/components/data-table/pagination";
import { useChangeStatusRequestMutation } from "../../hooks/useRequest";
import { toast } from "sonner";
import { RequestDetailDialog } from "./request-detail-dialog";

export function RequestManagementList() {
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
  const [reviewRequest, setReviewRequest] = useState<{
    isOpen: boolean;
    request?: RequestType;
  }>({
    isOpen: false,
    request: undefined,
  });
  const [viewRequest, setViewRequest] = useState<{
    isOpen: boolean;
    request?: RequestType;
  }>({
    isOpen: false,
    request: undefined,
  });

  const {
    mutate: changeStatusRequestMutation,
    isPending: isChangeStatusPending,
  } = useChangeStatusRequestMutation();

  const totalPages = requests
    ? Math.max(PAGE, Math.ceil(requests.total / LIMIT))
    : PAGE;

  const handleApprove = async () => {
    if (!reviewRequest.request) return;
    changeStatusRequestMutation(
      {
        id: reviewRequest.request.id,
        status: RequestStatus.APPROVED,
      },
      {
        onSuccess: () => {
          toast.success("Yêu cầu đã được duyệt thành công!");
          setReviewRequest({ isOpen: false, request: undefined });
        },
        onError: (error) => {
          toast.error(error?.message || "Duyệt yêu cầu thất bại!");
        },
      }
    );
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewRequest({ isOpen: true, request: u })}
          >
            <Eye className="h-4 w-4 mr-2" />
            Chi tiết
          </Button>

          {u.status === RequestStatus.APPROVED ? (
            <Button variant="outline" size="sm" disabled className="w-32">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Đã duyệt
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-32"
              onClick={() => {
                setReviewRequest({
                  isOpen: true,
                  request: u,
                });
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Duyệt
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <h2 className="text-2xl font-bold tracking-tight">Duyệt yêu cầu</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
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

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <RequestDetailDialog
        open={viewRequest.isOpen}
        onClose={() => setViewRequest({ isOpen: false, request: undefined })}
        request={viewRequest.request}
      />

      <BaseDialog
        open={reviewRequest.isOpen}
        onClose={() => setReviewRequest({ isOpen: false, request: undefined })}
        title="Duyệt yêu cầu"
        description={`Bạn có chắc chắn muốn duyệt yêu cầu "${reviewRequest.request?.title}" không?`}
      >
        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              setReviewRequest({ isOpen: false, request: undefined })
            }
          >
            Hủy
          </Button>
          <Button onClick={handleApprove} disabled={isChangeStatusPending}>
            {isChangeStatusPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </div>
      </BaseDialog>
    </div>
  );
}
