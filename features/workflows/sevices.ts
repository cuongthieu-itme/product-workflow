import request from "@/configs/axios-config";
import { mockWorkFlowProcess } from "./mock";
import { WorkFlowProcessFilterInput } from "./types";

export const getWorkflowProcesses = (params?: WorkFlowProcessFilterInput) => {
  return mockWorkFlowProcess;
};

export const deleteWorkflowProcess = async (id: number) => {
  try {
    const response = await request.delete(`/workflowProcesses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
