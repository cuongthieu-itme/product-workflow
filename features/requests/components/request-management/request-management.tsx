"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Eye, CheckCircle, XCircle, X, Clock } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { useGetRequestsQuery } from "../../hooks";
import { RequestStatus, RequestType } from "../../type";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { TablePagination } from "@/components/data-table/pagination";
import { RequestConfirmDialog } from "./request-confirm-dialog";
import { RequestRejectDialog } from "./request-reject-dialog";
import { RequestHoldDialog } from "./request-hold-dialog";
import { useRouter } from "next/navigation";

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
  const [rejectRequest, setRejectRequest] = useState<{
    isOpen: boolean;
    request?: RequestType;
  }>({
    isOpen: false,
    request: undefined,
  });

  const [holdRequest, setHoldRequest] = useState<{
    isOpen: boolean;
    request?: RequestType;
  }>({
    isOpen: false,
    request: undefined,
  });

  const router = useRouter();

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
      id: "createdBy",
      header: "Người tạo",
      cell: (u) =>
        u.createdBy ? `${u.createdBy.fullName} (${u.createdBy.email})` : "N/A",
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
            onClick={
              () => router.push(`/dashboard/requests/${u.id}`) // Navigate to request detail page
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            Chi tiết
          </Button>

          {u.status === RequestStatus.REJECTED ? (
            <Button variant="outline" size="sm" className="w-28" disabled>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Đã từ chối
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-28"
              disabled={
                u.status === RequestStatus.APPROVED ||
                u.status === RequestStatus.HOLD
              }
              onClick={() => {
                setRejectRequest({
                  isOpen: true,
                  request: u,
                });
              }}
            >
              <X className="h-4 w-4 mr-2 text-red-500" />
              Từ chối
            </Button>
          )}

          {u.status === RequestStatus.HOLD ? (
            <Button variant="outline" size="sm" className="w-28" disabled>
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Đang hold
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-28"
              disabled={
                u.status === RequestStatus.APPROVED ||
                u.status === RequestStatus.REJECTED
              }
              onClick={() => {
                setHoldRequest({
                  isOpen: true,
                  request: u,
                });
              }}
            >
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Hold
            </Button>
          )}

          {u.status === RequestStatus.APPROVED ? (
            <Button variant="outline" size="sm" disabled className="w-28">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Đã duyệt
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-28"
              disabled={
                u.status === RequestStatus.REJECTED ||
                u.status === RequestStatus.HOLD
              }
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
          />

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

      <RequestConfirmDialog
        onClose={() => setReviewRequest({ isOpen: false, request: undefined })}
        open={reviewRequest.isOpen}
        request={reviewRequest.request}
      />

      <RequestRejectDialog
        onClose={() => setRejectRequest({ isOpen: false, request: undefined })}
        open={rejectRequest.isOpen}
        request={rejectRequest.request}
      />

      <RequestHoldDialog
        onClose={() => setHoldRequest({ isOpen: false, request: undefined })}
        open={holdRequest.isOpen}
        request={holdRequest.request}
      />
    </div>
  );
}
