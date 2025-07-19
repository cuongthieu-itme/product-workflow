import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { useFormContext } from "react-hook-form";
import { RequestInputType } from "../../schema";
import { cn } from "@/lib/utils";

export const MaterialTable = () => {
  const { data: materials } = useMaterialsQuery({ limit: 1000, page: 1 });
  const { watch } = useFormContext<RequestInputType>();

  const ids = watch("accessoryIds");
  const selectedMaterials =
    materials?.data.filter((material) => ids.includes(material.id)) ?? [];

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) {
      return {
        label: "Còn hàng",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
      };
    } else if (quantity > 0) {
      return {
        label: "Sắp hết",
        variant: "secondary" as const,
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
      };
    } else {
      return {
        label: "Hết hàng",
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
      };
    }
  };

  return selectedMaterials.length > 0 ? (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
            <Package className="h-4 w-4 text-black" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-800">
              Nguyên vật liệu đã chọn
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {selectedMaterials.length} vật liệu được chọn
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-b-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-150">
                <TableHead className="font-semibold text-gray-700">
                  Mã vật liệu
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Tên nguyên vật liệu
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700">
                  Số lượng
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700">
                  Tình trạng
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700">
                  Yêu cầu nhập
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMaterials.map((material, index) => {
                const stockStatus = getStockStatus(material.quantity);
                const StatusIcon = stockStatus.icon;

                return (
                  <TableRow
                    key={material.id}
                    className="group hover:bg-blue-50/50 transition-colors duration-200"
                  >
                    <TableCell className="font-mono text-sm font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full opacity-60" />
                        {material.code}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {material.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold text-gray-800">
                          {material.quantity}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({material.unit})
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant={stockStatus.variant}
                          className={cn(
                            "flex items-center gap-1 shadow-sm",
                            stockStatus.bgColor
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          Yêu cầu nhập
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa khỏi danh sách</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="shadow-sm border border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Chưa có nguyên vật liệu nào
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Vui lòng chọn nguyên vật liệu từ danh sách để hiển thị thông tin chi
          tiết
        </p>
      </CardContent>
    </Card>
  );
};
