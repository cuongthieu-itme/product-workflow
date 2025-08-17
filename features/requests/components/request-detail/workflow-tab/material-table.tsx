import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { useFormContext } from "react-hook-form";
import { CreateProductInputType } from "@/features/products/schema";
import { MaterialTableEmpty } from "@/features/requests/form/material/material-table/material-table-empty";
import { MaterialTableHeader } from "@/features/requests/form/material/material-table/material-table-header";
import { MaterialTableRow } from "@/features/requests/form/material/material-table/material-table-row";

export const MaterialTable = () => {
  const { data: materials } = useMaterialsQuery({ limit: 1000, page: 1 });
  const { watch, setValue } = useFormContext<CreateProductInputType>();

  const ids = watch("productMaterials").map((m) => m.materialId);
  const selectedMaterials =
    materials?.data
      .filter((material) => ids.includes(Number(material.id)))
      .map((material) => {
        const field = watch("productMaterials").find(
          (m) => m.materialId === Number(material.id)
        );
        return {
          ...material,
          quantity: field?.quantity || 1,
        };
      }) ?? [];

  const removeMaterial = (materialId: number) => {
    const updatedMaterials = watch("productMaterials").filter(
      (m) => m.materialId !== materialId
    );
    setValue("productMaterials", updatedMaterials);
  };

  const handleCreateImportRequest = (materialId: number, requestInput: any) => {
    const materialsField = watch("productMaterials");
    const index = materialsField.findIndex((m) => m.materialId === materialId);
    if (index === -1) return;
    const updatedMaterials = [...materialsField];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
    };
    setValue("productMaterials", updatedMaterials);
  };

  const handleCancelImportRequest = (materialId: number) => {
    const materialsField = watch("productMaterials");
    const index = materialsField.findIndex((m) => m.materialId === materialId);
    if (index === -1) return;
    const updatedMaterials = [...materialsField];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
    };
    setValue("productMaterials", updatedMaterials);
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
