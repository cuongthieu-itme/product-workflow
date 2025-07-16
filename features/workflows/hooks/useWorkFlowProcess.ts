import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOfUpdateWorkflowProcess,
  deleteWorkflowProcess,
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

export const useCreateOfUpdateWPMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOfUpdateWorkflowProcess,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESSES],
      });

      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESS, data.id],
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

export const useDeleteWFPMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkflowProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESS_QUERY_KEY.WORKFLOW_PROCESS],
      });
    },
  });
};
