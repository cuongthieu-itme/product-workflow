import { format } from "date-fns";
import { RequestStatus } from "./type";

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
