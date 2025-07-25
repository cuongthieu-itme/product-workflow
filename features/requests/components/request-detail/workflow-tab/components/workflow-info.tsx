import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  ProcedureHistory,
  StatusSubprocessHistory,
  SubprocessHistoryType,
} from "@/features/requests/type";
import {
  calculateCompletionPercentage,
  calculateCurrentStep,
} from "@/features/requests/helpers";

interface WorkflowInfoProps {
  workflow: ProcedureHistory;
}

export const WorkflowInfo = ({ workflow }: WorkflowInfoProps) => {
  const currentStep = calculateCurrentStep(workflow.subprocessesHistory);

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
              Số bước hiển thị
            </p>
            <p>{workflow.subprocessesHistory.length} bước</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tiến độ</p>
            <p>
              {calculateCompletionPercentage(workflow.subprocessesHistory)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Bước hiện tại
            </p>
            <p>{currentStep.name}</p>
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
