import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkflowProcess,
  getWorkflowProcessById,
  getWorkflowProcesses,
} from "../sevices";
import { WorkFlowProcessFilterInput } from "../types";

export enum WORKFLOW_PROCESS_QUERY_KEY {
  WORKFLOW_PROCESS = "workflowProcess",
  WORKFLOW_PROCESSES = "workflowProcesses",
}

export const useWorkFlowProcessesQuery = (
  params?: WorkFlowProcessFilterInput
) => {
  return useQuery({
    queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESSES],
    queryFn: () => getWorkflowProcesses(params),
  });
};

export const useCreateWorkflowProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflowProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESSES],
      });
    },
  });
};

export const useGetWorkflowProcessByIdQuery = (id: number) => {
  return useQuery({
    queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESS, id],
    queryFn: () => getWorkflowProcessById(id),
    enabled: !!id,
  });
};
