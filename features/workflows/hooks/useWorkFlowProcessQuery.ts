import { useQuery } from "@tanstack/react-query";
import { getWorkflowProcesses } from "../sevices";
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
