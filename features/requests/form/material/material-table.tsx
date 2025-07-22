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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Package, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RequestInputType } from "../../schema";

export const MaterialTable = () => {
  const { data: materials } = useMaterialsQuery({ limit: 1000, page: 1 });
  const { watch, setValue, control } = useFormContext<RequestInputType>();

  const [showImportForm, setShowImportForm] = useState<number | null>(null);
  const [importQuantity, setImportQuantity] = useState<number>(1);
  const [importDate, setImportDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [importSupplier, setImportSupplier] = useState<string>("");
  const [sourceCountry, setSourceCountry] = useState<string>("");
  const [importPrice, setImportPrice] = useState<number | undefined>(undefined);
  const [importReason, setImportReason] = useState<string>("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const ids = watch("materials").map((m) => m.materialId);
  const selectedMaterials =
    materials?.data
      .filter((material) => ids.includes(Number(material.id)))
      .map((material) => {
        const field = watch("materials").find(
          (m) => m.materialId === Number(material.id)
        );
        return {
          ...material,
          quantity: field?.quantity || 1,
          requestInput: field?.requestInput ?? null,
        };
      }) ?? [];

  const removeMaterial = (materialId: number) => {
    const updatedMaterials = watch("materials").filter(
      (m) => m.materialId !== materialId
    );
    setValue("materials", updatedMaterials);
  };

  const handleShowImportForm = (material: any) => {
    setShowImportForm(material.id);
    setImportQuantity(1);
    setImportDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setImportSupplier("");
    setSourceCountry("");
    setImportPrice(undefined);
    setImportReason("");
  };

  const handleCreateImportRequest = (materialId: number) => {
    const materialsField = watch("materials");
    const index = materialsField.findIndex((m) => m.materialId === materialId);
    if (index === -1) return;
    const updatedMaterials = [...materialsField];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      requestInput: {
        quantity: importQuantity,
        expectedDate: importDate.toISOString(),
        supplier: importSupplier || undefined,
        sourceCountry: sourceCountry || undefined,
        price: importPrice,
        reason: importReason || undefined,
      },
    };
    setValue("materials", updatedMaterials);
    setShowImportForm(null);
  };

  const handleCancelImportRequest = (materialId: number) => {
    const materialsField = watch("materials");
    const index = materialsField.findIndex((m) => m.materialId === materialId);
    if (index === -1) return;
    const updatedMaterials = [...materialsField];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      requestInput: null,
    };
    setValue("materials", updatedMaterials);
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
              {selectedMaterials.length} vật liệu được chọn • Tổng:{" "}
              {selectedMaterials.reduce(
                (total, item) => total + item.quantity,
                0
              )}{" "}
              sản phẩm
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
                  Yêu cầu nhập
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMaterials.map((material) => {
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
                      {material.requestInput ? (
                        <div className="flex flex-col items-center">
                          <span className="text-green-500 text-sm">Đã tạo</span>
                          <span className="text-xs">
                            {material.requestInput.quantity} {material.unit}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-blue-500 cursor-help">
                                  Chi tiết
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="w-64">
                                <div className="space-y-1 text-xs">
                                  <p>
                                    <span className="font-medium">Số lượng:</span>{" "}
                                    {material.requestInput.quantity} {material.unit}
                                  </p>
                                  <p>
                                    <span className="font-medium">Ngày dự kiến:</span>{" "}
                                    {format(
                                      new Date(material.requestInput.expectedDate),
                                      "dd/MM/yyyy"
                                    )}
                                  </p>
                                  {material.requestInput.supplier && (
                                    <p>
                                      <span className="font-medium">Nhà cung cấp:</span>{" "}
                                      {material.requestInput.supplier}
                                    </p>
                                  )}
                                  {material.requestInput.sourceCountry && (
                                    <p>
                                      <span className="font-medium">Xuất xứ:</span>{" "}
                                      {material.requestInput.sourceCountry}
                                    </p>
                                  )}
                                  {material.requestInput.price && (
                                    <p>
                                      <span className="font-medium">Giá nhập:</span>{" "}
                                      {material.requestInput.price.toLocaleString()} VNĐ/
                                      {material.unit}
                                    </p>
                                  )}
                                  {material.requestInput.reason && (
                                    <p>
                                      <span className="font-medium">Lý do:</span>{" "}
                                      {material.requestInput.reason}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-red-500"
                            onClick={() => handleCancelImportRequest(Number(material.id))}
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : showImportForm === material.id ? (
                        <div className="flex flex-col gap-2 p-2 border rounded-md">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`import-quantity-${material.id}`}
                              className="text-xs"
                            >
                              Số lượng
                            </Label>
                            <div className="flex items-center gap-1">
                              <Input
                                id={`import-quantity-${material.id}`}
                                type="number"
                                min="1"
                                value={importQuantity}
                                onChange={(e) => setImportQuantity(Number(e.target.value))}
                                className="h-7"
                              />
                              <span className="text-xs">{material.unit}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`import-date-${material.id}`}
                              className="text-xs"
                            >
                              Ngày dự kiến
                            </Label>
                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal h-7 text-xs"
                                >
                                  <Calendar className="mr-2 h-3 w-3" />
                                  {importDate ? (
                                    format(importDate, "dd/MM/yyyy", { locale: vi })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={importDate}
                                  onSelect={(date) => {
                                    setImportDate(date || new Date());
                                    setDatePickerOpen(false);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`import-supplier-${material.id}`}
                              className="text-xs"
                            >
                              Nhà cung cấp
                            </Label>
                            <Input
                              id={`import-supplier-${material.id}`}
                              value={importSupplier}
                              onChange={(e) => setImportSupplier(e.target.value)}
                              placeholder="Nhập nhà cung cấp"
                              className="h-7 text-xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`source-country-${material.id}`}
                              className="text-xs"
                            >
                              Quốc gia nguồn nhập
                            </Label>
                            <Input
                              id={`source-country-${material.id}`}
                              value={sourceCountry}
                              onChange={(e) => setSourceCountry(e.target.value)}
                              placeholder="Nhập quốc gia nguồn nhập"
                              className="h-7 text-xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`import-price-${material.id}`}
                              className="text-xs"
                            >
                              Giá nhập (VNĐ/{material.unit})
                            </Label>
                            <Input
                              id={`import-price-${material.id}`}
                              type="number"
                              value={importPrice ?? ""}
                              onChange={(e) =>
                                setImportPrice(
                                  e.target.value ? Number(e.target.value) : undefined
                                )
                              }
                              placeholder="Nhập giá nhập"
                              className="h-7 text-xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`import-reason-${material.id}`}
                              className="text-xs"
                            >
                              Lý do
                            </Label>
                            <Textarea
                              id={`import-reason-${material.id}`}
                              value={importReason}
                              onChange={(e) => setImportReason(e.target.value)}
                              placeholder="Nhập lý do"
                              className="h-16 min-h-0 text-xs"
                            />
                          </div>

                          <div className="flex gap-1 justify-end mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleCreateImportRequest(Number(material.id))}
                            >
                              Tạo
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => setShowImportForm(null)}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={() => handleShowImportForm(material)}
                        >
                          Tạo yêu cầu
                        </Button>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              onClick={() =>
                                removeMaterial(Number(material.id))
                              }
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
