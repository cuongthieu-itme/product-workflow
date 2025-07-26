import { KEY_EMPTY_SELECT } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useGetRequestsQuery } from "@/features/requests/hooks";
import {
  AlertCircle,
  Check,
  Circle,
  FileText,
  Workflow,
  User,
  DollarSign,
  Calendar,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetRequestByProductStatusQuery } from "@/features/requests/hooks/useRequest";

export function WorkFlow({ productStatusId }: { productStatusId: number }) {
  const { data: request, isLoading: isRequestLoading } =
    useGetRequestByProductStatusQuery(productStatusId);
  console.log("request", request);
  const [selectedRequestId, setSelectedRequestId] = useState<
    string | undefined
  >(request && request[0] ? request[0].id.toString() : undefined);

  const selectedRequest = request?.find(
    (req) => req.id.toString() == selectedRequestId
  );

  const isLoading = isRequestLoading;

  // useEffect reset state
  useEffect(() => {
    setSelectedRequestId(
      request && request[0] ? request[0].id.toString() : undefined
    );
  }, [request]);

  console.log("selectedRequestId", selectedRequest);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="relative pl-12 pb-6">
                <div className="absolute left-0 top-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tính toán tiến độ
  const steps = selectedRequest?.procedureHistory?.subprocessesHistory || [];
  const completedSteps = steps.filter(
    (step) => step.status === "COMPLETED" || step.status === "SKIPPED"
  ).length;
  const progressPercentage =
    steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <Card>
      {/* Header với Select */}
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Workflow className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Quy trình công việc</CardTitle>
              <CardDescription>
                Theo dõi tiến độ thực hiện các bước
              </CardDescription>
            </div>
          </div>

          {/* Select luôn hiển thị */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">
              Chọn yêu cầu
            </label>
            <Select
              value={selectedRequestId}
              onValueChange={(value) => {
                setSelectedRequestId(value);
              }}
            >
              <SelectTrigger className="w-full lg:w-[280px]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <SelectValue placeholder="Chọn yêu cầu để xem quy trình" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-full lg:w-[280px]">
                {request?.length ? (
                  request.map((req) => (
                    <SelectItem key={req.id} value={String(req.id)}>
                      <div className="py-1">
                        <span>{req.title}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Không có yêu cầu nào</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Bar */}
        {steps.length > 0 && (
          <div className="mt-6 p-4 border rounded-md bg-card">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {selectedRequest?.procedureHistory?.name ||
                    "Quy trình công việc"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{steps.length} bước
                </span>
                <Badge variant="secondary">{progressPercentage}%</Badge>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Bắt đầu</span>
              <span>Hoàn thành</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[50vh] pr-3">
          <div className="relative">
            {(() => {
              // Xác định index của bước hiện tại (đầu tiên chưa hoàn thành hoặc bị bỏ qua)
              const currentStepIndex = steps.findIndex(
                (step) =>
                  step.status !== "COMPLETED" && step.status !== "SKIPPED"
              );

              if (steps.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Workflow className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {selectedRequest ? "Chưa có quy trình" : "Chọn yêu cầu"}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {selectedRequest
                        ? "Yêu cầu này chưa được gán quy trình làm việc nào. Vui lòng liên hệ quản trị viên để thiết lập quy trình."
                        : "Vui lòng chọn một yêu cầu từ danh sách trên để xem chi tiết quy trình làm việc."}
                    </p>
                    {!selectedRequest && request?.length && (
                      <div className="mt-4 p-3 border rounded-md">
                        <p className="text-sm text-blue-600">
                          <Info className="h-4 w-4 inline mr-1" />
                          Có {request.length} yêu cầu đang chờ xử lý
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              return steps.map((step, index) => {
                // Xác định trạng thái bước
                let statusLabel = "Chưa bắt đầu";
                let statusBadgeClass =
                  "bg-gray-100 text-gray-700 border-gray-200";
                let StatusIcon = Circle;
                let iconBgClass = "bg-gray-100";
                let iconClass = "text-gray-500";
                let cardClass = "border-gray-200 bg-white hover:bg-gray-50";

                if (step.status === "COMPLETED" || step.status === "SKIPPED") {
                  statusLabel =
                    step.status === "SKIPPED" ? "Đã bỏ qua" : "Hoàn thành";
                  statusBadgeClass =
                    step.status === "SKIPPED"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-green-100 text-green-700 border-green-200";
                  StatusIcon = step.status === "SKIPPED" ? AlertCircle : Check;
                  iconBgClass =
                    step.status === "SKIPPED"
                      ? "bg-orange-100"
                      : "bg-green-100";
                  iconClass =
                    step.status === "SKIPPED"
                      ? "text-orange-600"
                      : "text-green-600";
                  cardClass =
                    step.status === "SKIPPED"
                      ? "border-orange-200 bg-orange-50/50"
                      : "border-green-200 bg-green-50/50";
                } else if (index === currentStepIndex) {
                  statusLabel = "Đang thực hiện";
                  statusBadgeClass =
                    "bg-blue-100 text-blue-700 border-blue-200";
                  StatusIcon = AlertCircle;
                  iconBgClass = "bg-blue-100";
                  iconClass = "text-blue-600";
                  cardClass = "border-blue-200 bg-blue-50/50 shadow-sm";
                }

                return (
                  <div key={step.id} className="relative mb-6 pl-12">
                    {/* Timeline line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[22px] top-12 bottom-0 w-[2px] bg-primary/20"></div>
                    )}

                    {/* Timeline icon */}
                    <div className="absolute left-0 top-0">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm ${
                          index === currentStepIndex
                            ? "border-primary bg-primary text-white"
                            : step.status === "COMPLETED"
                            ? "border-green-600 bg-green-50"
                            : step.status === "SKIPPED"
                            ? "border-orange-500 bg-orange-50"
                            : "border-primary/30 bg-background"
                        }`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            index === currentStepIndex
                              ? "text-white"
                              : iconClass
                          }`}
                        />
                      </div>
                    </div>

                    {/* Step card */}
                    <div
                      className={`rounded-lg border p-4 ${
                        index === currentStepIndex
                          ? "border-primary/20 bg-primary/5 shadow-sm"
                          : step.status === "COMPLETED"
                          ? "border-green-200 bg-green-50/20"
                          : step.status === "SKIPPED"
                          ? "border-orange-200 bg-orange-50/20"
                          : "border-border bg-card/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            {step.name}
                          </h4>
                          <Badge
                            variant={
                              step.status === "COMPLETED"
                                ? "default"
                                : step.status === "SKIPPED"
                                ? "destructive"
                                : index === currentStepIndex
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-xs ${
                              step.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-background font-normal"
                        >
                          {index + 1}/{steps.length}
                        </Badge>
                      </div>

                      {step.description && (
                        <p className="mt-2 text-xs text-muted-foreground border-l-2 border-muted pl-2 mb-3">
                          {step.description}
                        </p>
                      )}

                      {/* Step metadata */}
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Thời gian:
                            </span>{" "}
                            <span className="font-medium">
                              {step.estimatedNumberOfDays || 1} ngày
                            </span>
                          </div>
                        </div>

                        {step.roleOfThePersonInCharge && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50">
                              <User className="h-3.5 w-3.5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Người phụ trách:
                              </span>{" "}
                              <span className="font-medium">
                                {step.roleOfThePersonInCharge}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {step.isStepWithCost && (
                        <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-xs">
                          <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-amber-600 font-medium">
                            Bước này có phát sinh chi phí
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
