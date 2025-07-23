import { TabsContent } from "@/components/ui/tabs";
import { WorkflowSteps } from "./components/workflow-steps";
import { mockWorkflow, mockCurrentRequest } from "./components/mock";
import { WorkflowInfo } from "./components/workflow-info";

export const WorkFlowTab = () => {
  return (
    <TabsContent value="workflow">
      <div className="space-y-6">
        <WorkflowInfo
          workflow={mockWorkflow}
          currentRequest={mockCurrentRequest}
        />
        <WorkflowSteps
          steps={mockWorkflow.steps}
          currentRequest={mockCurrentRequest}
        />
      </div>
    </TabsContent>
  );
};
