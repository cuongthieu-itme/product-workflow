import { PaginatedResult } from "@/types/common";
import { WorkFlowProcessType } from "./types";

export const mockWorkFlowProcess: PaginatedResult<"data", WorkFlowProcessType> =
  {
    data: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Quy trình ${index + 1}`,
      description: `Quy trình xử lý yêu cầu ${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: Array.from({ length: 5 }, (_, stepIndex) => ({
        id: stepIndex + 1,
        name: `Bước ${stepIndex + 1}`,
        description: `Bước xử lý yêu cầu ${stepIndex + 1}`,
        estimatedDays: 3,
        roleUserEnsure: `Quy trình ${index + 1}`,
        notifyBeforeDeadline: 1,
        stepRequired: true,
        stepWithCost: true,
      })),
    })),
    total: 10,
    page: 1,
    limit: 10,
  };
