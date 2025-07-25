import { TabsContent } from "@/components/ui/tabs";
import { WorkflowSteps } from "./components/workflow-steps";
import { WorkflowInfo } from "./components/workflow-info";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";

export const WorkFlowTab = () => {
  const { data: request } = useGetRequestDetailQuery();

  if (!request) return <div>Không tìm thấy yêu cầu</div>;

  return (
    <TabsContent value="workflow">
      <div className="space-y-6">
        <WorkflowInfo workflow={request?.procedureHistory} />
        <WorkflowSteps
          subprocessHistory={request?.procedureHistory.subprocessesHistory}
        />
      </div>
    </TabsContent>
  );
};
