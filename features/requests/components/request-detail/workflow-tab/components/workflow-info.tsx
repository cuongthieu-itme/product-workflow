import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ProcedureHistory } from "@/features/requests/type";
import {
  calculateCompletionPercentage,
  calculateCurrentStep,
  getHoldInfo,
} from "@/features/requests/helpers";
import { format } from "date-fns";

interface WorkflowInfoProps {
  workflow?: ProcedureHistory;
}

export const WorkflowInfo = ({ workflow }: WorkflowInfoProps) => {
  const currentStep = calculateCurrentStep(workflow?.subprocessesHistory);

  // Tính toán thông tin hold/continue tổng hợp
  const totalHoldInfo = workflow?.subprocessesHistory.reduce(
    (acc, step) => {
      const stepHoldInfo = getHoldInfo(step);
      acc.totalHolds += stepHoldInfo.holdCount;
      acc.totalContinues += stepHoldInfo.continueCount;
      return acc;
    },
    { totalHolds: 0, totalContinues: 0 }
  ) || { totalHolds: 0, totalContinues: 0 };

  if (!workflow) {
    return <div>Quy trình chưa được gán</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Thông tin quy trình
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tên quy trình
            </p>
            <p>{workflow?.name}</p>
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
            <p>{currentStep?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Tổng lần tạm dừng
            </p>
            <p>{totalHoldInfo.totalHolds} lần</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Play className="w-3 h-3 text-green-600" />
              Tổng lần tiếp tục
            </p>
            <p>{totalHoldInfo.totalContinues} lần</p>
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

        {/* Chi tiết tạm dừng/tiếp tục theo từng bước */}
        {workflow.subprocessesHistory.some(
          (step) => getHoldInfo(step).holdCount > 0
        ) && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Lịch sử tạm dừng/tiếp tục theo bước
            </p>
            <div className="space-y-3">
              {workflow.subprocessesHistory.map((step) => {
                const holdInfo = getHoldInfo(step);
                if (holdInfo.holdCount === 0) return null;

                return (
                  <div key={step.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm mb-2">{step.name}</p>
                    <div className="space-y-2">
                      {step.holdDateOne && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-medium">
                              Tạm dừng 1:
                            </span>
                            <span>
                              {format(
                                new Date(step.holdDateOne),
                                "dd/MM HH:mm"
                              )}
                            </span>
                          </div>
                          {step.continueDateOne && (
                            <div className="flex items-center gap-1 sm:ml-4">
                              <span className="text-green-600 font-medium">
                                → Tiếp tục:
                              </span>
                              <span>
                                {format(
                                  new Date(step.continueDateOne),
                                  "dd/MM HH:mm"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {step.holdDateTwo && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-medium">
                              Tạm dừng 2:
                            </span>
                            <span>
                              {format(
                                new Date(step.holdDateTwo),
                                "dd/MM HH:mm"
                              )}
                            </span>
                          </div>
                          {step.continueDateTwo && (
                            <div className="flex items-center gap-1 sm:ml-4">
                              <span className="text-green-600 font-medium">
                                → Tiếp tục:
                              </span>
                              <span>
                                {format(
                                  new Date(step.continueDateTwo),
                                  "dd/MM HH:mm"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {step.holdDateThree && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-medium">
                              Tạm dừng 3:
                            </span>
                            <span>
                              {format(
                                new Date(step.holdDateThree),
                                "dd/MM HH:mm"
                              )}
                            </span>
                          </div>
                          {step.continueDateThree && (
                            <div className="flex items-center gap-1 sm:ml-4">
                              <span className="text-green-600 font-medium">
                                → Tiếp tục:
                              </span>
                              <span>
                                {format(
                                  new Date(step.continueDateThree),
                                  "dd/MM HH:mm"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
