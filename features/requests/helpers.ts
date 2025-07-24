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

export const getStatusColor = (status: StatusSubprocessHistory) => {
  switch (status) {
    case StatusSubprocessHistory.COMPLETED:
      return "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700";
    case StatusSubprocessHistory.IN_PROGRESS:
      return "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700";
    case StatusSubprocessHistory.PENDING:
      return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700";
    case StatusSubprocessHistory.CANCELLED:
      return "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700";
  }
};

export const getStatusText = (status: StatusSubprocessHistory) => {
  switch (status) {
    case StatusSubprocessHistory.COMPLETED:
      return "Hoàn thành";
    case StatusSubprocessHistory.IN_PROGRESS:
      return "Đang thực hiện";
    case StatusSubprocessHistory.PENDING:
      return "Chưa bắt đầu";
    case StatusSubprocessHistory.CANCELLED:
      return "Đã hủy";
    default:
      return "Chưa bắt đầu";
  }
};
