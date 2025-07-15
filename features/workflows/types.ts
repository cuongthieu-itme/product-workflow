export type WorkFlowStepType = {
  id: number;
  name: string;
  description: string;
  estimatedNumberOfDays: number;
  roleOfThePersonInCharge: string;
  numberOfDaysBeforeDeadline: number;
  isRequired: boolean;
  isStepWithCost: boolean;
};

export type WorkFlowProcessType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subprocesses: Array<WorkFlowStepType>;
  version: number;
  updateAt: string;
};

export type WorkFlowProcessFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};
