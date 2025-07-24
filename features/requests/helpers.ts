import { format } from "date-fns";
import { SourceEnum } from "./constants";
import { RequestInputType } from "./schema";
import {
  RequestDetail,
  RequestStatus,
  StatusSubprocessHistory,
  SubprocessHistoryType,
} from "./type";

interface ToRequestFormInputParams {
  detail?: RequestDetail;
  sourceSelected: SourceEnum;
}

export function toRequestFormInput({
  detail,
  sourceSelected,
}: ToRequestFormInputParams): RequestInputType {
  return {
    title: detail?.title ?? "",
    description: detail?.description ?? "",
    productLink: detail?.productLink?.map((u) => ({ url: u })) ?? [{ url: "" }],
    media: detail?.media ?? [],
    source: detail?.source ?? sourceSelected,
    customerId: detail?.customerId ?? undefined,
    createdById: detail?.createdById,
    materials:
      detail?.requestMaterials?.map((rm) => ({
        materialId: rm.material.id,
        quantity: rm.quantity,
        requestInput: rm.material.requestInput,
      })) ?? [],
    sourceOtherId: detail?.sourceOtherId ?? undefined,
  };
}

export const calculateCompletionPercentage = (
  items: SubprocessHistoryType[]
) => {
  if (!items || items.length === 0) return 0;

  const completedCount = items.filter(
    (item) => item.status === StatusSubprocessHistory.COMPLETED
  ).length;
  return Math.round((completedCount / items.length) * 100);
};

export const formatDate = (
  date: Date | string | null | undefined,
  formatType?: string
) => {
  if (!date) return "-";

  return format(new Date(date), formatType || "dd/MM/yyyy");
};

export const generateRequestStatus = (status?: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDING:
      return "Đang chờ duyệt";
    case RequestStatus.APPROVED:
      return "Đã phê duyệt";
    case RequestStatus.REJECTED:
      return "Đã từ chối";
    default:
      return "Đang chờ duyệt";
  }
};

export const getStatusColor = (status?: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDING:
      return "bg-yellow-500 text-white";
    case RequestStatus.APPROVED:
      return "bg-blue-500 text-white";
    case RequestStatus.REJECTED:
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};
