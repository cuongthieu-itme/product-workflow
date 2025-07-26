import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Edit,
  FileText,
  Package,
  User,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useGetRequestDetailQuery } from "../../hooks";
import {
  calculateCompletionPercentage,
  calculateCurrentStep,
  formatDate,
  generateRequestStatus,
  getRequestStatusColor,
  getStatusText,
} from "../../helpers";
import { useRouter } from "next/navigation";
import { RequestStatus } from "../../type";

interface OverViewTabProps {
  onChangeTab?: (tab: string) => void;
}

export const OverViewTab: React.FC<OverViewTabProps> = ({ onChangeTab }) => {
  const { data: request } = useGetRequestDetailQuery();

  const router = useRouter();
  const currentStep = calculateCurrentStep(
    request?.procedureHistory?.subprocessesHistory
  );
  const isRequestApproved = request?.status === RequestStatus.APPROVED;

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mã yêu cầu
                </p>
                <p>{request?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </p>

                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "mt-1 cursor-pointer hover:opacity-80",
                      getRequestStatusColor(request?.status)
                    )}
                  >
                    {generateRequestStatus(request?.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tiếp nhận
                </p>
                <p>{formatDate(request?.createdAt, "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Người liên quan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {request?.createdBy?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Người tạo</p>
                <p className="font-medium">
                  {request?.createdBy?.fullName || "Không có dữ liệu"}
                </p>
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request?.sourceOther ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {request.sourceOther?.name?.charAt(0) || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request.sourceOther?.name || "Không có dữ liệu"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {request.sourceOther?.id}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {request?.customer?.fullName?.charAt(0) || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request?.customer?.fullName || "Không có dữ liệu"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {request?.customer?.id}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    router.push(
                      `/dashboard/customers/${request?.customer?.id}`
                    );
                  }}
                >
                  Xem chi tiết khách hàng
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Tóm tắt quy trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRequestApproved ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ</span>
                    <span>
                      {calculateCompletionPercentage(
                        request?.procedureHistory?.subprocessesHistory
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={calculateCompletionPercentage(
                      request?.procedureHistory?.subprocessesHistory
                    )}
                    className="h-2"
                  />
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
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Yêu cầu chưa được phê duyệt. Không có thông tin quy trình.
              </p>
            )}
          </CardContent>
        </Card>

        {request?.status === RequestStatus.REJECTED && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                {request?.status === RequestStatus.REJECTED
                  ? "Yêu cầu bị từ chối"
                  : "Yêu cầu tạm dừng"}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Thêm sau Workflow Summary Card */}
        {calculateCompletionPercentage(
          request?.procedureHistory?.subprocessesHistory
        ) === 100 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Quy trình hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700">
                Tất cả các bước trong quy trình đã được hoàn thành thành công.
                Bạn có thể chuyển đổi yêu cầu này thành sản phẩm.
              </p>
              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Package className="h-4 w-4 mr-2" />
                  Chuyển thành sản phẩm
                </Button>
                <Button variant="outline">Xuất báo cáo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hiển thị nếu đã chuyển thành sản phẩm */}
        {/* {request?.status === "converted_to_product" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="h-5 w-5" />
                Đã chuyển thành sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-700">
                Yêu cầu này đã được chuyển đổi thành sản phẩm thành công.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Xem sản phẩm
                </Button>
                <Button variant="outline">Tạo yêu cầu mới</Button>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Mô tả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded flex items-start gap-2">
            <div className="flex-1">
              {request?.description || "Không có mô tả"}
            </div>
            <Edit className="h-4 w-4 opacity-50 mt-1" />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
