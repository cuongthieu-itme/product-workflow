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
import {
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
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
import { MaterialTableHeader } from "./material-table/material-table-header";
import { MaterialTableRow } from "./material-table/material-table-row";
import { MaterialTableEmpty } from "./material-table/material-table-empty";

export const MaterialTable = () => {
  const { data: materials } = useMaterialsQuery({ limit: 1000, page: 1 });
  const { watch, setValue } = useFormContext<RequestInputType>();

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

  const handleCreateImportRequest = (materialId: number, requestInput: any) => {
    const materialsField = watch("materials");
    const index = materialsField.findIndex((m) => m.materialId === materialId);
    if (index === -1) return;
    const updatedMaterials = [...materialsField];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      requestInput: {
        ...requestInput,
        expectedDate: requestInput.expectedDate.toISOString(),
      },
    };
    setValue("materials", updatedMaterials);
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

  if (selectedMaterials.length === 0) {
    return <MaterialTableEmpty />;
  }

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/30">
      <MaterialTableHeader
        selectedCount={selectedMaterials.length}
        totalQuantity={selectedMaterials.reduce(
          (total, item) => total + item.quantity,
          0
        )}
      />
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
              {selectedMaterials.map((material) => (
                <MaterialTableRow
                  key={material.id}
                  material={material}
                  onRemove={removeMaterial}
                  onCreateRequest={handleCreateImportRequest}
                  onCancelRequest={handleCancelImportRequest}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
