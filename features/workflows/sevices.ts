import request from "@/configs/axios-config";
import { WorkFlowProcessFilterInput, WorkFlowProcessType } from "./types";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { omitVoid } from "@/utils/removeParams";
import { CreateWorkflowInputType } from "./schema/create-workflow-schema";

export const getWorkflowProcesses = async (
  params?: WorkFlowProcessFilterInput
) => {
  try {
    const response = await request.get<
      PaginatedResult<"data", WorkFlowProcessType>
    >("/procedures", { params: omitVoid(params) });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteWorkflowProcess = async (id: number) => {
  try {
    const response = await request.delete<WorkFlowProcessType>(
      `/procedures/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createWorkflowProcess = async (data: CreateWorkflowInputType) => {
  try {
    const response = await request.post<WorkFlowProcessType>(
      "/procedures/create-or-update",
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWorkflowProcessById = async (id: number) => {
  try {
    const response = await request.get<BaseResultQuery<WorkFlowProcessType>>(
      `/procedures/${id}`
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
