import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkflowProcess } from "../sevices";
import { WORKFLOW_PROCESS_QUERY_KEY } from "./useWorkFlowProcessQuery";

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
