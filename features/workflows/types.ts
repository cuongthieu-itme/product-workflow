export type WorkFlowStepType = {
  id: number;
  name: string;
  description: string;
  estimatedDays: number;
  roleUserEnsure: string;
  notifyBeforeDeadline: number;
  stepRequired: boolean;
  stepWithCost: boolean;
};

export type WorkFlowProcessType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  steps: Array<WorkFlowStepType>;
};

export type WorkFlowProcessFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};
