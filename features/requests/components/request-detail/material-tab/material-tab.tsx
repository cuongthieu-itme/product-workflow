import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockMaterials = [
  {
    id: "1",
    code: "VL001",
    name: "Gỗ thông tự nhiên",
    type: "material",
    description: "Gỗ thông chất lượng cao, đã qua xử lý chống mối mọt",
    unit: "m3",
    quantity: 50,
    price: 1500000,
    requestedQuantity: 2,
  },
  {
    id: "2",
    code: "VL002",
    name: "Keo dán gỗ",
    type: "accessory",
    description: "Keo dán gỗ chuyên dụng, chất lượng cao",
    unit: "chai",
    quantity: 100,
    price: 50000,
    requestedQuantity: 5,
  },
  {
    id: "3",
    code: "VL003",
    name: "Sơn PU trong suốt",
    type: "material",
    description: "Sơn PU chất lượng cao, bảo hành 1 năm",
    unit: "lít",
    quantity: 30,
    price: 250000,
    requestedQuantity: 3,
  },
];

const selectedMaterials = [...mockMaterials];

export const MaterialTab = () => {
  return (
    <TabsContent value="materials">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold">Vật liệu yêu cầu</h3>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Thêm vật liệu
            </Button>
          </div>
          <p className="text-muted-foreground">
            Quản lý danh sách vật liệu cần thiết cho yêu cầu này
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedMaterials.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  Danh sách vật liệu ({selectedMaterials.length})
                </h4>
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sắp xếp theo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Tên vật liệu</SelectItem>
                      <SelectItem value="price">Giá</SelectItem>
                      <SelectItem value="quantity">Số lượng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                {selectedMaterials.map((material: any, index: number) => (
                  <div
                    key={material.id || index}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-card/90 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <h5 className="font-medium">{material.name}</h5>
                        <Badge variant="outline" className="ml-2">
                          {material.code}
                        </Badge>
                        <Badge
                          variant={
                            material.type === "material"
                              ? "default"
                              : "secondary"
                          }
                          className="ml-2"
                        >
                          {material.type === "material"
                            ? "Vật liệu"
                            : "Phụ kiện"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {material.description}
                      </p>
                      <div className="flex items-center gap-6 mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Đơn vị:</span>
                          <span className="font-medium">{material.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Tồn kho:
                          </span>
                          <span className="font-medium">
                            {material.quantity || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Giá:</span>
                          <span className="font-medium">
                            {material.price?.toLocaleString() || 0} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8">
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" variant="destructive" className="h-8">
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
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
