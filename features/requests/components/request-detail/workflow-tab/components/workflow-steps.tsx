import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  Circle,
  ChevronRight,
  Clock,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkflowStep, CurrentRequest, WorkflowField } from "./types";
import { useState } from "react";

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  currentRequest: CurrentRequest;
}

export const WorkflowSteps = ({
  steps,
  currentRequest,
}: WorkflowStepsProps) => {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "in_progress":
        return "bg-orange-50 text-orange-600 border-orange-200";
      default:
        return "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang thực hiện";
      default:
        return "Chưa bắt đầu";
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const handleStepClick = (step: WorkflowStep) => {
    setSelectedStep(step);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChevronRight className="h-5 w-5" />
          Các bước quy trình
        </CardTitle>
        <CardDescription>
          {steps.length} bước • Tiến độ:{" "}
          {Math.round(
            (steps.filter((step) => step.status === "completed").length /
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
              <div className="flex gap-4 min-w-max">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <Button
                      variant="outline"
                      className={`w-40 ${getStatusColor(
                        step.status
                      )} hover:bg-gray-50 transition-colors duration-200 rounded-lg`}
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
                    <Badge
                      variant={
                        selectedStep.status === "completed"
                          ? "outline"
                          : selectedStep.status === "in_progress"
                          ? "outline"
                          : "outline"
                      }
                    >
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
