import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkflowStep, WorkflowField } from "./types";
import { useState, useEffect } from "react";
import { Check, Circle, AlertCircle } from "lucide-react";
import {
  useGetRequestDetailQuery,
  useGetSubprocessHistoryQuery,
} from "@/features/requests/hooks/useRequest";
import { StatusSubprocessHistory } from "@/features/requests/type";
import { getStatusColor, getStatusText } from "@/features/requests/helpers";

interface WorkflowStepsProps {
  steps: WorkflowStep[];
}

export const WorkflowSteps = ({ steps }: WorkflowStepsProps) => {
  const { data: request } = useGetRequestDetailQuery();
  const { data: subprocessHistory } = useGetSubprocessHistoryQuery({
    procedureId: 3,
  });
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  // Auto focus on next step when current step is completed
  useEffect(() => {
    if (steps) {
      // Find the next step after step COMPLETED
      const completedStepIndex = steps.findIndex(
        (step) => step.status === StatusSubprocessHistory.COMPLETED
      );
      if (completedStepIndex >= 0 && completedStepIndex < steps.length - 1) {
        const nextStep = steps[completedStepIndex + 1];
        setSelectedStep(nextStep);
      }
    }
  }, [steps]);

  const getStepIcon = (status: StatusSubprocessHistory) => {
    switch (status) {
      case StatusSubprocessHistory.COMPLETED:
        return <Check className="h-5 w-5" />;
      case StatusSubprocessHistory.IN_PROGRESS:
        return <AlertCircle className="h-5 w-5" />;
      case StatusSubprocessHistory.PENDING:
        return <Circle className="h-5 w-5" />;
      case StatusSubprocessHistory.CANCELLED:
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const getStepFocusColor = (id: string) => {
    const step = selectedStep?.id === id;
    return step
      ? "shadow-lg shadow-lg transform-translate-y-1 transition-all duration-300"
      : "";
  };

  const handleStepClick = (step: WorkflowStep) => {
    setSelectedStep(step);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Các bước quy trình
        </CardTitle>
        <CardDescription>
          {steps.length} bước • Tiến độ:{" "}
          {Math.round(
            (steps.filter(
              (step) => step.status === StatusSubprocessHistory.COMPLETED
            ).length /
              steps.length) *
              100
          )}
          %
        </CardDescription>
      </CardHeader>
      <CardContent>
        {steps.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max mt-5">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <Button
                      variant="outline"
                      className={`w-44 ${getStatusColor(
                        step.status
                      )} transition-colors duration-200 rounded-lg ${getStepFocusColor(
                        step.id
                      )}`}
                      onClick={() => handleStepClick(step)}
                    >
                      <div className="flex flex-col items-center justify-center gap-3 p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${getStatusColor(
                              step.status
                            )}`}
                          >
                            {getStepIcon(step.status)}
                          </div>
                          <span className="font-medium text-sm">
                            {step.name}
                          </span>
                        </div>
                      </div>
                    </Button>
                    {index < steps.length - 1 && (
                      <div className="flex items-center">
                        <div className="h-px w-12 bg-gray-200 ml-2" />
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedStep && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedStep.assignee?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedStep.assignee?.name || "Chưa có người thực hiện"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStep.assignee?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <Badge variant="outline">
                      {getStatusText(selectedStep.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hạn xử lý</p>
                    <p className="text-sm">
                      {selectedStep.dueDate || "Chưa xác định"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian ước tính</p>
                    <p className="text-sm">
                      {selectedStep.estimatedTime}{" "}
                      {selectedStep.estimatedTimeUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Có thể bỏ qua</p>
                    <Badge
                      variant={
                        selectedStep.isOptional ? "default" : "destructive"
                      }
                    >
                      {selectedStep.isOptional ? "Có" : "Không"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Mô tả
                  </p>
                  <p className="text-sm">
                    {selectedStep.description || "Chưa có mô tả"}
                  </p>
                </div>
                {selectedStep.fields && selectedStep.fields.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Các trường dữ liệu
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStep.fields.map((field: WorkflowField) => (
                        <div
                          key={field.id}
                          className="p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {field.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Không có bước nào trong quy trình
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
