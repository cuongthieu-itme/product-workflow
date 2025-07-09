import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WORKFLOW_PROCESSES_QUERY_KEY } from "./useWorkFlowProcessQuery";
import { deleteWorkflowProcess } from "../sevices";

export const useDeleteWFPMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkflowProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_PROCESSES_QUERY_KEY],
      });
    },
  });
};
