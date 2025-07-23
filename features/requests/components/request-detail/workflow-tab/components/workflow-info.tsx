import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { WorkflowData, CurrentRequest, WorkflowStep } from "./types";

interface WorkflowInfoProps {
  workflow: WorkflowData;
  currentRequest: CurrentRequest;
}

export const WorkflowInfo = ({
  workflow,
  currentRequest,
}: WorkflowInfoProps) => {
  const getProgress = (steps: WorkflowStep[]) => {
    const completedSteps = steps.filter((step) => step.status === "completed");
    return Math.round((completedSteps.length / steps.length) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Thông tin quy trình
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tên quy trình
            </p>
            <p>{workflow.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Loại quy trình
            </p>
            <p>
              {currentRequest.isUsingStandardWorkflow
                ? "Quy trình chuẩn"
                : "Quy trình tùy chỉnh"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Số bước hiển thị
            </p>
            <p>{workflow.steps.length} bước</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tiến độ</p>
            <p>{getProgress(workflow.steps)}%</p>
          </div>
        </div>

        {workflow.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Mô tả quy trình
            </p>
            <p className="text-sm">{workflow.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
