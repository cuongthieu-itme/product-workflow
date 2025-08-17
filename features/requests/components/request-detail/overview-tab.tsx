import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, User, Users } from "lucide-react";
import React from "react";
import { useGetRequestDetailQuery } from "../../hooks";
import { formatDate } from "../../helpers";
import { useRouter } from "next/navigation";
import { PriorityBadge, StatusBadge } from "../badge";
import { WorkflowStatusCard } from "./workflow-status-card";

interface OverViewTabProps {
  onChangeTab?: (tab: string) => void;
}

export const OverViewTab: React.FC<OverViewTabProps> = ({ onChangeTab }) => {
  const { data: request } = useGetRequestDetailQuery();

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
                <p>{request?.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </p>

                <div className="flex items-center gap-2 ">
                  {request?.status ? (
                    <StatusBadge status={request?.status} />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tiếp nhận
                </p>
                <p>{formatDate(request?.createdAt, "dd/MM/yyyy HH:mm")}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground ">
                  Độ ưu tiên
                </p>

                <div className="flex items-center gap-2">
                  {request?.priority ? (
                    <PriorityBadge priority={request?.priority} />
                  ) : (
                    "-"
                  )}
                </div>
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

        <WorkflowStatusCard
          request={request}
          onChangeTab={onChangeTab}
          onConvertToProduct={() => {
            // Handle convert to product logic here
            console.log("Convert to product clicked");
          }}
        />
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
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
