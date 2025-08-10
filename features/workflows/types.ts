import { DepartmentType } from "../departments/type";
import {
  OutputTypeEnum,
  SameAssignInputType,
} from "./schema/create-workflow-schema";

export type WorkFlowStepType = {
  id: number;
  name: string;
  description: string;
  estimatedNumberOfDays: number;
  roleOfThePersonInCharge: string;
  numberOfDaysBeforeDeadline: number;
  isRequired: boolean;
  isStepWithCost: boolean;
  department: DepartmentType;
  step: number;
  fieldSubprocess: {
    checkFields: string[];
  };
};

export type WorkFlowProcessType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subprocesses: Array<WorkFlowStepType>;
  version: number;
  sameAssigns: SameAssignInputType[];
  outputType: OutputTypeEnum;
  updateAt: string;
};

export type WorkFlowProcessFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};

export type FieldType = {
  label: string;
  value: string;
  type: string;
  enumValue: string;
  valueType?: string;
  source?: string;
};
