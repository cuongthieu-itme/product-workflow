import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Check, Circle, AlertCircle } from "lucide-react";
import {
  StatusSubprocessHistory,
  SubprocessHistoryType,
} from "@/features/requests/type";
import {
  calculateCompletionPercentage,
  formatDate,
  getStatusColor,
  getStatusText,
} from "@/features/requests/helpers";
import { StepEditForm } from "./step-form";
import { getImageUrl } from "@/features/settings/utils";

// StepEditForm sẽ được thêm phía dưới file này

interface WorkflowStepsProps {
  subprocessHistory: SubprocessHistoryType[];
}

import { useGetUserInfoQuery } from "@/features/auth/hooks/useGetUserInfoQuery";

export const WorkflowSteps = ({ subprocessHistory }: WorkflowStepsProps) => {
  const [selectedStep, setSelectedStep] =
    useState<SubprocessHistoryType | null>(null);
  const { data: currentUserData } = useGetUserInfoQuery();

  // Auto focus on next step when current step is completed
  useEffect(() => {
    if (subprocessHistory) {
      // Find the next step after step COMPLETED || SKIPPED
      // Focus first step if dont have step COMPLETED || SKIPPED
      // Focus last step when is last step is COMPLETED || SKIPPED
      const completedStepIndex = subprocessHistory.findIndex(
        (step) =>
          step.status === StatusSubprocessHistory.COMPLETED ||
          step.status === StatusSubprocessHistory.SKIPPED
      );

      if (completedStepIndex >= 0) {
        const nextStep = subprocessHistory[completedStepIndex + 1];
        if (nextStep) {
          setSelectedStep(nextStep);
        } else {
          const lastStep = subprocessHistory[completedStepIndex];
          setSelectedStep(lastStep);
        }
      } else {
        const firstStep = subprocessHistory[0];
        setSelectedStep(firstStep);
      }
    }
  }, [subprocessHistory]);

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

  const getStepFocusColor = (id: number) => {
    const step = selectedStep?.id === id;
    return step
      ? "shadow-lg shadow-lg transform-translate-y-1 transition-all duration-300"
      : "";
  };

  const handleStepClick = (step: SubprocessHistoryType) => {
    setSelectedStep(step);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Các bước quy trình
        </CardTitle>
        <CardDescription>
          {subprocessHistory.length} bước • Tiến độ:{" "}
          {calculateCompletionPercentage(subprocessHistory)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subprocessHistory.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max mt-5">
                {subprocessHistory.map((step, index) => (
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
                          <span className="font-medium text-sm max-w-[100px] truncate">
                            {step.name}
                          </span>
                        </div>
                      </div>
                    </Button>
                    {index < subprocessHistory.length - 1 && (
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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg overflow-visible">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 cursor-pointer border-2 border-dashed p-[3px]">
                    <AvatarImage
                      src={getImageUrl(selectedStep?.user?.avatarUrl)}
                      alt={selectedStep.user?.fullName}
                      className="rounded-full"
                    />
                    <AvatarFallback>
                      {selectedStep.user?.fullName?.[0] ?? "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedStep.user?.fullName || "Chưa có người thực hiện"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStep.user?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <Badge variant="outline">
                      {getStatusText(selectedStep.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hạn xử lý</p>
                    <p className="text-sm">
                      {formatDate(selectedStep.endDate, "dd/MM/yyyy HH:mm") ||
                        "Chưa xác định"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian ước tính</p>
                    <p className="text-sm">
                      {selectedStep.estimatedNumberOfDays} ngày
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Có thể bỏ qua</p>
                    <Badge
                      variant={
                        selectedStep.isRequired ? "destructive" : "default"
                      }
                    >
                      {selectedStep.isRequired ? "Không" : "Có"}
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

                <StepEditForm
                  step={selectedStep}
                  steps={subprocessHistory}
                  currentUser={currentUserData}
                />
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
