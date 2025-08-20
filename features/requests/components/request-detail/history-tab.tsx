import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Package,
  Circle,
} from "lucide-react";
import { format } from "date-fns";
import { TabsContent } from "@/components/ui/tabs";

const mockHistory = [
  {
    id: 1,
    action: "complete_step",
    details: "Hoàn thành bước Phân tích yêu cầu",
    userName: "Nguyễn Văn A",
    timestamp: "2025-07-23T12:00:00",
    metadata: {
      stepName: "Phân tích yêu cầu",
      assignee: { name: "Nguyễn Văn A" },
      reason: "Đã hoàn thành phân tích chi tiết",
    },
  },
  {
    id: 2,
    action: "change_status",
    details: "Thay đổi trạng thái từ Đang xử lý sang Đã hoàn thành",
    userName: "Trần Thị B",
    timestamp: "2025-07-23T14:30:00",
    metadata: {
      oldStatus: { name: "Đang xử lý" },
      newStatus: { name: "Đã hoàn thành" },
    },
  },
  {
    id: 3,
    action: "hold_step",
    details: "Đặt lại bước Phân tích yêu cầu",
    userName: "Lê Văn C",
    timestamp: "2025-07-23T15:00:00",
    metadata: {
      stepName: "Phân tích yêu cầu",
      reason: "Cần thêm thông tin từ khách hàng",
    },
  },
];

export const HistoryTab = () => {
  return (
    <TabsContent value="history">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Lịch sử thay đổi
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {mockHistory.length} mục
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {false ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Đang tải lịch sử...</p>
            </div>
          ) : mockHistory.length > 0 ? (
            <div className="space-y-6">
              {mockHistory.map((entry: any, index: number) => (
                <div
                  key={entry.id || index}
                  className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {entry.action === "complete_step" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : entry.action === "reject_step" ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : entry.action === "hold_step" ? (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    ) : entry.action === "continue_workflow" ? (
                      <ArrowRight className="h-5 w-5 text-green-600" />
                    ) : entry.action === "change_status" ? (
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    ) : entry.action === "convert_to_product" ? (
                      <Package className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {entry.details}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {entry.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(entry.timestamp),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.userName}
                        </p>
                      </div>
                    </div>
                    {entry.metadata && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {entry.metadata.reason && (
                          <p>
                            <strong>Lý do:</strong> {entry.metadata.reason}
                          </p>
                        )}
                        {entry.metadata.stepName && (
                          <p>
                            <strong>Bước:</strong> {entry.metadata.stepName}
                          </p>
                        )}
                        {entry.metadata.assignee && (
                          <p>
                            <strong>Người thực hiện:</strong>{" "}
                            {entry.metadata.assignee.name}
                          </p>
                        )}
                        {entry.metadata.oldStatus &&
                          entry.metadata.newStatus && (
                            <p>
                              <strong>Thay đổi trạng thái:</strong>{" "}
                              {entry.metadata.oldStatus.name ||
                                entry.metadata.oldStatus}{" "}
                              →{" "}
                              {entry.metadata.newStatus.name ||
                                entry.metadata.newStatus}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <History className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Chưa có lịch sử thay đổi nào
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
