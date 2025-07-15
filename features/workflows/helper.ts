import { SubProcessInputType } from "./schema/create-workflow-schema";
import { WorkFlowStepType } from "./types";

export const convertSubProcessFormData = (
  subProcess: WorkFlowStepType[]
): SubProcessInputType[] => {
  return subProcess.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    estimatedNumberOfDays: s.estimatedNumberOfDays,
    numberOfDaysBeforeDeadline: s.numberOfDaysBeforeDeadline,
    roleOfThePersonInCharge: s.roleOfThePersonInCharge,
    departmentId: s.department.id,
    isRequired: s.isRequired,
    isStepWithCost: s.isStepWithCost,
    step: s.step,
  }));
};
