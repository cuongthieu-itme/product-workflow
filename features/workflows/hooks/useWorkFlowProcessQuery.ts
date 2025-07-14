import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkflowProcess, getWorkflowProcesses } from "../sevices";
import { WorkFlowProcessFilterInput } from "../types";

export const WORKFLOW_PROCESSES_QUERY_KEY = "workflowProcesses";

export const useWorkFlowProcessesQuery = (
  params?: WorkFlowProcessFilterInput
) => {
  return useQuery({
    queryKey: [WORKFLOW_PROCESSES_QUERY_KEY],
    queryFn: () => getWorkflowProcesses(params),
  });
};

export const useCreateWorkflowProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflowProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESSES_QUERY_KEY],
      });
    },
  });
};
