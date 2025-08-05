import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Package,
  FileText,
  Calendar,
} from "lucide-react";
import {
  RequestStatus,
  SubprocessHistoryType,
  RequestDetail,
} from "../../type";
import {
  calculateCompletionPercentage,
  calculateCurrentStep,
  getStatusText,
  formatDate,
} from "../../helpers";

interface WorkflowStatusCardProps {
  request?: RequestDetail;
  onChangeTab?: (tab: string) => void;
  onConvertToProduct?: () => void;
}

export const WorkflowStatusCard: React.FC<WorkflowStatusCardProps> = ({
  request,
  onChangeTab,
  onConvertToProduct,
}) => {
  const currentStep = calculateCurrentStep(
    request?.procedureHistory?.subprocessesHistory
  );

  const completionPercentage = calculateCompletionPercentage(
    request?.procedureHistory?.subprocessesHistory
  );

  const isRequestApproved = request?.status === RequestStatus.APPROVED;
  const isRequestRejected = request?.status === RequestStatus.REJECTED;
  const isRequestHold = request?.status === RequestStatus.HOLD;

  const approvalInfo = request?.approvalInfo;

  const renderApprovedState = () => (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ</span>
          <span>{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Bước hiện tại
          </p>
          <p>{currentStep?.name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Trạng thái
          </p>
          <p>{getStatusText(currentStep?.status)}</p>
        </div>
      </div>

      {/* Production Plan Section */}
      {approvalInfo?.productionPlan && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Kế hoạch sản xuất
            </span>
          </div>
          <p className="text-sm text-green-700">
            {approvalInfo.productionPlan}
          </p>
        </div>
      )}

      {/* Files Section */}
      {approvalInfo?.files && approvalInfo.files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Tài liệu đính kèm
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvalInfo.files.map((file, index) => (
              <a
                key={index}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
              >
                Tài liệu {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (onChangeTab) {
            onChangeTab("workflow");
          }
        }}
      >
        Xem chi tiết quy trình
      </Button>

      {/* Show completion card if workflow is completed */}
      {completionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50 mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Quy trình hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              Tất cả các bước trong quy trình đã được hoàn thành thành công. Bạn
              có thể chuyển đổi yêu cầu này thành sản phẩm.
            </p>
            <div className="flex gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onConvertToProduct}
              >
                <Package className="h-4 w-4 mr-2" />
                Chuyển thành sản phẩm
              </Button>
              <Button variant="outline">Xuất báo cáo</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderRejectedState = () => (
    <>
      <p className="text-sm text-muted-foreground">
        Yêu cầu đã bị từ chối. Không có thông tin quy trình.
      </p>
      <Card className="border-red-200 bg-red-50 mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Yêu cầu bị từ chối
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-red-700">
            Yêu cầu này đã bị từ chối và không thể tiếp tục quy trình.
          </p>
          {approvalInfo?.denyReason && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Lý do từ chối
                </span>
              </div>
              <p className="text-sm text-red-700">{approvalInfo.denyReason}</p>
            </div>
          )}
          {approvalInfo?.files && approvalInfo.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Tài liệu đính kèm
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {approvalInfo.files.map((file, index) => (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded border border-red-200 hover:bg-red-200"
                  >
                    Tài liệu {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-red-600">
            Ngày từ chối:{" "}
            {formatDate(approvalInfo?.createdAt, "dd/MM/yyyy HH:mm")}
          </p>
        </CardContent>
      </Card>
    </>
  );

  const renderHoldState = () => (
    <>
      <p className="text-sm text-muted-foreground">
        Yêu cầu đang tạm dừng. Quy trình sẽ được tiếp tục sau khi được phê duyệt
        lại.
      </p>
      <Card className="border-yellow-200 bg-yellow-50 mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            Yêu cầu tạm dừng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-yellow-700">
            Yêu cầu này đang tạm dừng và cần được xem xét lại trước khi tiếp
            tục.
          </p>
          {approvalInfo?.holdReason && (
            <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Lý do tạm dừng
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                {approvalInfo.holdReason}
              </p>
            </div>
          )}
          {approvalInfo?.files && approvalInfo.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Tài liệu đính kèm
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {approvalInfo.files.map((file, index) => (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded border border-yellow-200 hover:bg-yellow-200"
                  >
                    Tài liệu {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-yellow-600">
            Ngày tạm dừng:{" "}
            {formatDate(approvalInfo?.updatedAt, "dd/MM/yyyy HH:mm")}
          </p>
        </CardContent>
      </Card>
    </>
  );

  const renderDefaultState = () => (
    <p className="text-sm text-muted-foreground">
      Yêu cầu chưa được phê duyệt. Không có thông tin quy trình.
    </p>
  );

  const getCardTitle = () => {
    if (isRequestApproved) return "Thông tin quy trình";
    if (isRequestHold) return "Thông tin tạm dừng";
    if (isRequestRejected) return "Thông tin bị từ chối";
    return "Thông tin quy trình";
  };

  const renderContent = () => {
    if (isRequestApproved) return renderApprovedState();
    if (isRequestRejected) return renderRejectedState();
    if (isRequestHold) return renderHoldState();
    return renderDefaultState();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          {getCardTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{renderContent()}</CardContent>
    </Card>
  );
};
