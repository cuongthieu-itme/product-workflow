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
} from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WorkFlow({ productStatusId }: { productStatusId: number }) {
  const { data: request, isLoading: isRequestLoading } = useGetRequestsQuery({
    limit: 10000,
    statusProductId: productStatusId,
  });
  const [selectedRequestId, setSelectedRequestId] = useState<
    string | undefined
  >(request?.data[0]?.id.toString() || undefined);

  const selectedRequest = request?.data.find(
    (req) => req.id.toString() == selectedRequestId
  );

  const isLoading = isRequestLoading;

  // useEffect reset state
  useEffect(() => {
    setSelectedRequestId(request?.data[0]?.id.toString() || undefined);
  }, [request]);

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
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
      {/* Header với Select */}
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm">
              <Workflow className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Quy trình công việc
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Theo dõi tiến độ thực hiện các bước
              </CardDescription>
            </div>
          </div>

          {/* Select luôn hiển thị */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Chọn yêu cầu
            </label>
            <Select
              value={selectedRequestId}
              onValueChange={(value) => {
                setSelectedRequestId(value);
              }}
            >
              <SelectTrigger className="w-full lg:w-[320px] bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-md">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <SelectValue
                    placeholder="Chọn một yêu cầu để xem quy trình"
                    className="text-gray-900 font-medium"
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="w-full lg:w-[320px] border-2 border-gray-200 shadow-xl">
                {request?.data?.length ? (
                  request.data.map((req) => (
                    <SelectItem
                      key={req.id}
                      value={String(req.id)}
                      className="hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150"
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {req.title}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    <div className="flex items-center gap-2 text-gray-500">
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
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-gray-800">
                  {selectedRequest?.procedureHistory?.name ||
                    "Quy trình công việc"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">
                  {completedSteps}/{steps.length} bước
                </span>
                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {progressPercentage}%
                </div>
              </div>
            </div>
            <Progress
              value={progressPercentage}
              className="h-3 bg-gray-200 shadow-inner"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Bắt đầu</span>
              <span>Hoàn thành</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="pr-4 max-h-[30vh] overflow-auto">
          <div className="space-y-8">
            {(() => {
              // Xác định index của bước hiện tại (đầu tiên chưa hoàn thành hoặc bị bỏ qua)
              const currentStepIndex = steps.findIndex(
                (step) =>
                  step.status !== "COMPLETED" && step.status !== "SKIPPED"
              );

              if (steps.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative">
                      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-6 shadow-sm">
                        <Workflow className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-3 w-3 text-yellow-700" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {selectedRequest ? "Chưa có quy trình" : "Chọn yêu cầu"}
                    </h3>
                    <p className="text-gray-600 max-w-md leading-relaxed">
                      {selectedRequest
                        ? "Yêu cầu này chưa được gán quy trình làm việc nào. Vui lòng liên hệ quản trị viên để thiết lập quy trình."
                        : "Vui lòng chọn một yêu cầu từ danh sách trên để xem chi tiết quy trình làm việc."}
                    </p>
                    {!selectedRequest && request?.data?.length && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          💡 Có {request.data.length} yêu cầu đang chờ xử lý
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
                  <div key={step.id} className="relative pl-16 pb-8 last:pb-0">
                    {/* Timeline line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-1 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 rounded-full"></div>
                    )}

                    {/* Timeline icon */}
                    <div className="absolute left-0 top-2">
                      <div
                        className={`h-12 w-12 rounded-full ${iconBgClass} flex items-center justify-center shadow-lg border-3 border-white ring-2 ring-gray-100 transition-all duration-200 hover:scale-105`}
                      >
                        <StatusIcon className={`w-6 h-6 ${iconClass}`} />
                      </div>
                    </div>

                    {/* Step card */}
                    <div
                      className={`${cardClass} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-xl mb-2 leading-tight">
                            {step.name}
                          </h4>
                          <Badge
                            className={`${statusBadgeClass} font-semibold px-3 py-1 text-sm`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            {index + 1}/{steps.length}
                          </div>
                        </div>
                      </div>

                      {step.description && (
                        <div className="mb-5 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {step.description}
                          </p>
                        </div>
                      )}

                      {/* Step metadata */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold text-sm">
                            {step.estimatedNumberOfDays || 1} ngày
                          </span>
                        </div>

                        {step.roleOfThePersonInCharge && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                            <User className="h-4 w-4" />
                            <span className="font-semibold text-sm">
                              {step.roleOfThePersonInCharge}
                            </span>
                          </div>
                        )}

                        {step.isStepWithCost && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-sm">
                              Có chi phí
                            </span>
                          </div>
                        )}
                      </div>
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
