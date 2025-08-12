import { format } from "date-fns";
import { PriorityEnum, SourceEnum } from "./constants";
import { RequestInputType } from "./schema";
import {
  RequestDetail,
  RequestStatus,
  StatusSubprocessHistory,
  SubprocessHistoryType,
} from "./type";
import { FieldType } from "../workflows/types";

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
    priority: detail?.priority ?? PriorityEnum.VERY_HIGH,
  };
}

export const calculateCompletionPercentage = (
  items?: SubprocessHistoryType[]
) => {
  if (!items || items.length === 0) return 0;

  const completedCount = items.filter((item) => item.isApproved).length;
  return Math.round((completedCount / items.length) * 100);
};

// Helper function để đếm số lần hold và kiểm tra có thể hold/continue
export const getHoldInfo = (subprocess: SubprocessHistoryType) => {
  const holdDates = [
    subprocess.holdDateOne,
    subprocess.holdDateTwo, 
    subprocess.holdDateThree,
  ];
  
  const continueDates = [
    subprocess.continueDateOne,
    subprocess.continueDateTwo,
    subprocess.continueDateThree,
  ];
  
  // Đếm số lần đã hold (có dữ liệu holdDate)
  const holdCount = holdDates.filter(Boolean).length;
  
  // Đếm số lần đã continue (có dữ liệu continueDate)
  const continueCount = continueDates.filter(Boolean).length;
  
  // Logic theo yêu cầu:
  // - Nếu có holdDateOne nhưng chưa có continueDateOne -> hiển thị continue 1
  // - Nếu có continueDateOne nhưng chưa có holdDateTwo -> hiển thị hold 2
  // - Nếu có holdDateTwo nhưng chưa có continueDateTwo -> hiển thị continue 2
  // - Nếu có continueDateTwo nhưng chưa có holdDateThree -> hiển thị hold 3
  // - Nếu có holdDateThree nhưng chưa có continueDateThree -> hiển thị continue 3
  // - Nếu có continueDateThree -> ẩn tất cả button
  
  let canHold = false;
  let canContinue = false;
  let nextAction = '';
  
  if (subprocess.continueDateThree) {
    // Đã hoàn thành tất cả chu kỳ hold/continue -> ẩn button
    canHold = false;
    canContinue = false;
    nextAction = 'none';
  } else if (subprocess.holdDateThree && !subprocess.continueDateThree) {
    // Đang hold lần 3 -> hiển thị continue 3
    canHold = false;
    canContinue = true;
    nextAction = 'continue3';
  } else if (subprocess.continueDateTwo && !subprocess.holdDateThree) {
    // Đã continue lần 2 -> hiển thị hold 3
    canHold = true;
    canContinue = false;
    nextAction = 'hold3';
  } else if (subprocess.holdDateTwo && !subprocess.continueDateTwo) {
    // Đang hold lần 2 -> hiển thị continue 2
    canHold = false;
    canContinue = true;
    nextAction = 'continue2';
  } else if (subprocess.continueDateOne && !subprocess.holdDateTwo) {
    // Đã continue lần 1 -> hiển thị hold 2
    canHold = true;
    canContinue = false;
    nextAction = 'hold2';
  } else if (subprocess.holdDateOne && !subprocess.continueDateOne) {
    // Đang hold lần 1 -> hiển thị continue 1
    canHold = false;
    canContinue = true;
    nextAction = 'continue1';
  } else {
    // Chưa hold lần nào -> hiển thị hold 1
    canHold = true;
    canContinue = false;
    nextAction = 'hold1';
  }
  
  const isCurrentlyOnHold = subprocess.status === StatusSubprocessHistory.HOLD;
  
  return {
    holdCount,
    continueCount,
    canHold,
    canContinue,
    isCurrentlyOnHold,
    nextAction,
    maxHolds: 3,
  };
};

// Helper function để xác định trường nào cần update khi hold
export const getHoldUpdateFields = (subprocess: SubprocessHistoryType) => {
  const currentTime = new Date().toISOString();
  
  if (!subprocess.holdDateOne) {
    return { holdDateOne: currentTime };
  } else if (!subprocess.holdDateTwo) {
    return { holdDateTwo: currentTime };
  } else if (!subprocess.holdDateThree) {
    return { holdDateThree: currentTime };
  }
  return {};
};

// Helper function để xác định trường nào cần update khi continue
export const getContinueUpdateFields = (subprocess: SubprocessHistoryType) => {
  const currentTime = new Date().toISOString();
  
  if (subprocess.holdDateOne && !subprocess.continueDateOne) {
    return { continueDateOne: currentTime };
  } else if (subprocess.holdDateTwo && !subprocess.continueDateTwo) {
    return { continueDateTwo: currentTime };
  } else if (subprocess.holdDateThree && !subprocess.continueDateThree) {
    return { continueDateThree: currentTime };
  }
  return {};
};export const formatDate = (
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
    case RequestStatus.HOLD:
      return "Tạm dừng";
    default:
      return "Đang chờ duyệt";
  }
};

export const getStatusColor = (status?: StatusSubprocessHistory) => {
  switch (status) {
    case StatusSubprocessHistory.COMPLETED:
      return "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700";
    case StatusSubprocessHistory.IN_PROGRESS:
      return "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700";
    case StatusSubprocessHistory.PENDING:
      return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700";
    case StatusSubprocessHistory.CANCELLED:
      return "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700";
    case StatusSubprocessHistory.SKIPPED:
      return "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-700";
    case StatusSubprocessHistory.HOLD:
      return "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700";
  }
};

export const getRequestStatusColor = (status?: RequestStatus) => {
  switch (status) {
    case RequestStatus.APPROVED:
      return "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700";
    case RequestStatus.PENDING:
      return "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700";
    case RequestStatus.REJECTED:
      return "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700";
    case RequestStatus.HOLD:
      return "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700";
  }
};

export const getStatusText = (status?: StatusSubprocessHistory) => {
  switch (status) {
    case StatusSubprocessHistory.COMPLETED:
      return "Hoàn thành";
    case StatusSubprocessHistory.IN_PROGRESS:
      return "Đang thực hiện";
    case StatusSubprocessHistory.PENDING:
      return "Chưa bắt đầu";
    case StatusSubprocessHistory.CANCELLED:
      return "Đã hủy";
    case StatusSubprocessHistory.SKIPPED:
      return "Đã bỏ qua";
    case StatusSubprocessHistory.HOLD:
      return "Đang tạm dừng";
    default:
      return "Chưa bắt đầu";
  }
};

export const calculateCurrentStep = (
  subprocessHistory?: SubprocessHistoryType[]
): SubprocessHistoryType | null => {
  // Early return if no history exists
  if (!subprocessHistory?.length) {
    return null;
  }

  // Find the last completed step
  const lastCompletedIndex =
    subprocessHistory
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.status === StatusSubprocessHistory.COMPLETED)
      .pop()?.index ?? -1;

  // No completed steps - return first step
  if (lastCompletedIndex === -1) {
    return subprocessHistory[0];
  }

  // All steps completed - return last step
  if (lastCompletedIndex === subprocessHistory.length - 1) {
    return subprocessHistory[lastCompletedIndex];
  }

  // Return next step after last completed
  return subprocessHistory[lastCompletedIndex + 1];
};

export const generatePriorityText = (priority?: PriorityEnum) => {
  switch (priority) {
    case PriorityEnum.VERY_HIGH:
      return "Rất cao";
    case PriorityEnum.HIGH:
      return "Cao";
    case PriorityEnum.MEDIUM:
      return "Trung bình";
    case PriorityEnum.NORMAL:
      return "Thấp";
    default:
      return "Chưa gán";
  }
};

export const getCheckFields = (step: SubprocessHistoryType): string[] => {
  // Lấy checkFields trực tiếp từ step.fieldSubprocess
  if (step.fieldSubprocess?.checkFields) {
    return step.fieldSubprocess.checkFields;
  }

  return [];
};

// Function để kiểm tra field có nên hiển thị không dựa vào checkFields
export const shouldShowField = (
  field: FieldType,
  step: SubprocessHistoryType,
  fields: FieldType[]
): boolean => {
  const checkFieldsList = getCheckFields(step);

  // Nếu không có fields data, return false
  if (!fields) return false;

  // Nếu không có checkFields list, hiển thị tất cả
  if (checkFieldsList.length === 0) return true;

  // Kiểm tra enumValue của field có trong checkFields list không
  const isIncluded = checkFieldsList.includes(field.enumValue);

  return isIncluded;
}; // Tạo dynamic schema dựa trên fields - simplified approach
