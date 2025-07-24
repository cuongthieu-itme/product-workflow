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
import { useState } from "react";
import { useGetRequestDetailQuery } from "../../hooks";
import {
  formatDate,
  generateRequestStatus,
  getRequestStatusColor,
  getStatusColor,
} from "../../helpers";
import { useRouter } from "next/navigation";

export const OverViewTab = () => {
  const { data: request } = useGetRequestDetailQuery();
  const [isEdit, setIsEdit] = useState(false);
  const mockData = {
    code: "REQ-001",
    status: "pending",
    receiveDate: "02/01/2023 12:00",
    deadline: "02/01/2023 12:00",
    creator: {
      fullName: "John Doe",
      department: "Marketing",
    },
    assignee: {
      fullName: "Jane Smith",
      department: "Sales",
    },
    description: "Yêu cầu này cần được xử lý",
    workflowProgress: 50,
    requestHistory: [
      {
        action: "create_request",
        timestamp: "2023-01-01T00:00:00Z",
        metadata: {
          reason: "Yêu cầu mới",
        },
      },
      {
        action: "update_request",
        timestamp: "2023-01-02T00:00:00Z",
        metadata: {
          reason: "Yêu cầu được cập nhật",
        },
      },
    ],
    priority: "high",
    dataSource: {
      type: "customer",
      fullName: "John Doe",
      id: "123",
    },
    customerId: "123",
    materials: [
      {
        name: "Material 1",
        quantity: 10,
        unit: "unit",
      },
      {
        name: "Material 2",
        quantity: 20,
        unit: "unit",
      },
    ],
  };

  const router = useRouter();

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
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Hạn hoàn thành
                </p>
                <p>{mockData.deadline}</p>
              </div>
              {/* <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Độ ưu tiên
                </p>
                <p>{mockData.priority}</p>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* People */}
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

        {/* Customer Info */}
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

        {/* Workflow Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Tóm tắt quy trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ</span>
                <span>{mockData.workflowProgress}%</span>
              </div>
              <Progress value={mockData.workflowProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bước hiện tại
                </p>
                <p>-</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </p>
                <p>-</p>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Xem chi tiết quy trình
            </Button>
          </CardContent>
        </Card>

        {/* Thêm sau Workflow Summary Card và trước card hoàn thành */}
        {(mockData.status === "rejected" || mockData.status === "on_hold") && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                {mockData.status === "rejected"
                  ? "Yêu cầu bị từ chối"
                  : "Yêu cầu tạm dừng"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-yellow-700">
                {mockData.status === "rejected"
                  ? "Yêu cầu này đã bị từ chối. Bạn có thể tiếp tục quy trình sau khi giải quyết các vấn đề được nêu."
                  : "Yêu cầu này đang tạm dừng. Bạn có thể tiếp tục quy trình khi sẵn sàng."}
              </p>

              {(() => {
                const latestRejectOrHold = mockData.requestHistory
                  .filter(
                    (entry: any) =>
                      (mockData.status === "rejected" &&
                        entry.action === "reject_step") ||
                      (mockData.status === "on_hold" &&
                        entry.action === "hold_step")
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )[0];

                return (
                  latestRejectOrHold &&
                  latestRejectOrHold.metadata?.reason && (
                    <div className="p-3 bg-white border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800">
                        Lý do{" "}
                        {mockData.status === "rejected"
                          ? "từ chối"
                          : "tạm dừng"}
                        :
                      </p>
                      <p className="text-sm text-gray-700">
                        {latestRejectOrHold.metadata.reason}
                      </p>
                    </div>
                  )
                );
              })()}

              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Tiếp tục quy trình
                </Button>
                <Button variant="outline">Xem lịch sử chi tiết</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Thêm sau Workflow Summary Card */}
        {mockData.workflowProgress === 100 &&
          mockData.status !== "converted_to_product" && (
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
        {mockData.status === "converted_to_product" && (
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
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Mô tả</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit ? (
            <div className="space-y-2">
              <Textarea rows={4} placeholder="Nhập mô tả..." />
              <div className="flex gap-2">
                <Button size="sm">Lưu</Button>
                <Button size="sm" variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded flex items-start gap-2">
              <div className="flex-1">
                {request?.description || "Không có mô tả"}
              </div>
              <Edit className="h-4 w-4 opacity-50 mt-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
