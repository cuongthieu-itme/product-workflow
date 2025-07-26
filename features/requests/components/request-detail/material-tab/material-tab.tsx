import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";
import { RequestMaterial } from "@/features/requests/type";
import { MaterialEnum } from "@/features/materials/constants";
import { AddMaterialDialog } from "./add-material-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRemoveMaterialFromRequestMutation } from "@/features/requests/hooks/useRequest";

export const MaterialTab = () => {
  const { data: request } = useGetRequestDetailQuery();
  const { toast } = useToast();
  const { mutate: removeMaterialFromRequest } =
    useRemoveMaterialFromRequestMutation();

  return (
    <TabsContent value="materials">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold">Vật liệu yêu cầu</h3>
            </div>
            <AddMaterialDialog request={request} />
          </div>
          <p className="text-muted-foreground">
            Quản lý danh sách vật liệu cần thiết cho yêu cầu này
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {request?.requestMaterials &&
          request?.requestMaterials?.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  Danh sách vật liệu ({request.requestMaterials.length})
                </h4>
              </div>
              <div className="space-y-4">
                {request.requestMaterials.map(
                  (m: RequestMaterial, index: number) => (
                    <div
                      key={m.id || index}
                      className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-card/90 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <h5 className="font-medium">{m.material.name}</h5>
                          <Badge variant="outline">{m.material.code}</Badge>
                          <Badge
                            variant={
                              m.material.type === MaterialEnum.MATERIAL
                                ? "default"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {m.material.type === MaterialEnum.MATERIAL
                              ? "Vật liệu"
                              : "Phụ kiện"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-muted-foreground mt-1">
                            Mô tả:
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {m.material.description || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Đơn vị:
                            </span>
                            <span className="font-medium">
                              {m.material.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Số lượng:
                            </span>
                            <span className="font-medium">
                              {m.quantity || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Giá:</span>
                            <span className="font-medium">0 VND</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() =>
                            removeMaterialFromRequest(
                              {
                                id: request.id,
                                materialId: m.id,
                              },
                              {
                                onSuccess: () => {
                                  toast({
                                    title: "Thành công",
                                    description:
                                      "Đã xóa vật liệu khỏi yêu cầu!",
                                  });
                                },
                                onError: () => {
                                  toast({
                                    title: "Lỗi",
                                    description:
                                      "Không thể xóa vật liệu, vui lòng thử lại sau.",
                                  });
                                },
                              }
                            )
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                Chưa có vật liệu nào được chọn
              </p>
              <p className="text-muted-foreground">
                Hãy thêm vật liệu bằng cách nhấn nút "Thêm vật liệu" ở trên
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
