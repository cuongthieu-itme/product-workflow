import { StatusSubprocessHistory } from "@/features/requests/type";

export interface WorkflowField {
  id: string;
  name: string;
  value: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  status: StatusSubprocessHistory;
  estimatedTime?: number;
  estimatedTimeUnit?: "hours" | "days";
  isOptional?: boolean;
  fields?: WorkflowField[];
  isRequired: boolean;
  isStepWithCost: boolean;
}

export interface CurrentRequest {
  id: string;
  isUsingStandardWorkflow: boolean;
  currentStepId: string;
  workflowId: string;
}
