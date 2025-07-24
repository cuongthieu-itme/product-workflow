import { StatusSubprocessHistory } from "@/features/requests/type";
import { WorkflowData, WorkflowStep, CurrentRequest } from "./types";

export const mockWorkflow: WorkflowData = {
  id: "workflow-1",
  name: "Quy trình chuẩn",
  description: "Quy trình chuẩn cho tất cả các yêu cầu",
  steps: [
    {
      id: "step-1",
      name: "Bước 1: Phân loại",
      description: "Phân loại yêu cầu dựa trên nội dung và mức độ ưu tiên",
      assignee: {
        id: "user-1",
        name: "Nguyễn Văn A",
        email: "nguyen.a@company.com",
      },
      dueDate: "2025-07-25",
      status: StatusSubprocessHistory.COMPLETED,
      estimatedTime: 2,
      estimatedTimeUnit: "hours",
      isOptional: false,
      fields: [
        {
          id: "field-1",
          name: "Loại yêu cầu",
          value: "Phân loại A",
        },
        {
          id: "field-2",
          name: "Mức độ ưu tiên",
          value: "Cao",
        },
      ],
      isRequired: true,
      isStepWithCost: true,
    },
    {
      id: "step-2",
      name: "Bước 2: Phân công",
      description: "Phân công người xử lý phù hợp với yêu cầu",
      assignee: {
        id: "user-2",
        name: "Trần Thị B",
        email: "tran.b@company.com",
      },
      dueDate: "2025-07-27",
      status: StatusSubprocessHistory.IN_PROGRESS,
      estimatedTime: 1,
      estimatedTimeUnit: "days",
      isOptional: false,
      fields: [
        {
          id: "field-3",
          name: "Người xử lý",
          value: "Trần Thị B",
        },
      ],
      isRequired: true,
      isStepWithCost: true,
    },
    {
      id: "step-3",
      name: "Bước 3: Xử lý",
      description: "Xử lý yêu cầu theo quy trình đã định",
      assignee: {
        id: "user-3",
        name: "Lê Văn C",
        email: "le.c@company.com",
      },
      dueDate: "2025-07-30",
      status: StatusSubprocessHistory.PENDING,
      estimatedTime: 8,
      estimatedTimeUnit: "hours",
      isOptional: true,
      fields: [
        {
          id: "field-4",
          name: "Trạng thái",
          value: "Chưa bắt đầu",
        },
      ],
      isRequired: true,
      isStepWithCost: true,
    },
    {
      id: "step-4",
      name: "Bước 4: Kiểm tra",
      description: "Kiểm tra kết quả xử lý và xác nhận hoàn thành",
      assignee: {
        id: "user-4",
        name: "Phạm Thị D",
        email: "pham.d@company.com",
      },
      dueDate: "2025-07-31",
      status: StatusSubprocessHistory.PENDING,
      estimatedTime: 2,
      estimatedTimeUnit: "hours",
      isOptional: false,
      fields: [
        {
          id: "field-5",
          name: "Kết quả",
          value: "",
        },
      ],
      isRequired: true,
      isStepWithCost: true,
    },
  ],
};

export const mockCurrentRequest: CurrentRequest = {
  id: "request-1",
  isUsingStandardWorkflow: true,
  currentStepId: "step-2",
  workflowId: "workflow-1",
};
