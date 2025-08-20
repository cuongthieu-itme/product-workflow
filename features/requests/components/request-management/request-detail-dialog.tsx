"use client";

import { BaseDialog } from "@/components/dialog";
import { useGetRequestDetailQuery } from "../../hooks/useRequest";
import { RequestType } from "../../type";

interface RequestDetailDialogProps {
  request?: RequestType;
  open: boolean;
  onClose: () => void;
}

export function RequestDetailDialog({
  open,
  onClose,
}: RequestDetailDialogProps) {
  const { data: requestDetail, isLoading } = useGetRequestDetailQuery();

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết yêu cầu"
      description="Xem chi tiết yêu cầu bên dưới"
    >
      {isLoading && <p>Loading...</p>}
      {requestDetail && (
        <div className="space-y-4">
          <p>
            <strong>Tên yêu cầu:</strong> {requestDetail.title}
          </p>
          <p>
            <strong>Mô tả:</strong> {requestDetail.description}
          </p>
        </div>
      )}
    </BaseDialog>
  );
}
