import { TabsContent } from "@/components/ui/tabs";
import { WorkflowSteps } from "./components/workflow-steps";
import { WorkflowInfo } from "./components/workflow-info";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";

export const WorkFlowTab = () => {
  const { data: request } = useGetRequestDetailQuery();

  if (!request)
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground rounded-md border bg-background">
        Không tìm thấy yêu cầu
      </div>
    );

  if (!request.procedureHistory?.subprocessesHistory) {
    return (
      <TabsContent value="workflow">
        <div className="mt-4 flex items-center justify-center p-4 text-muted-foreground rounded-md border bg-background">
          Yêu cầu chưa được gán quy trình
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="workflow">
      <div className="space-y-6">
        <WorkflowInfo workflow={request?.procedureHistory} />
        <WorkflowSteps
          subprocessHistory={request?.procedureHistory?.subprocessesHistory}
        />
      </div>
    </TabsContent>
  );
};
