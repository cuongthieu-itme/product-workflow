import { MaterialType } from "@/features/materials/type";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MaterialListProps {
  materials: MaterialType[];
  selectedMaterialId: string | null;
  handleMaterialSelect: (material: MaterialType) => void;
}

export const MaterialList = ({
  materials,
  selectedMaterialId,
  handleMaterialSelect,
}: MaterialListProps) => {
  return materials?.map((material) => (
    <div
      key={material.id}
      className={cn(
        "p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-md border ",
        selectedMaterialId === material.id
          ? "bg-blue-50 border-blue-500 border-2"
          : "border-gray-200"
      )}
      onClick={() => handleMaterialSelect(material)}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium">{material.name}</div>
            {selectedMaterialId === material.id && (
              <Check className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="text-sm text-gray-500">
            Mã: {material.code} | Đơn vị: {material.unit}
          </div>
          {material.description && (
            <div className="text-xs text-gray-400 mt-1">
              {material.description}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Xuất xứ: {material.origin} | Loại: Nguyên liệu
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-sm font-medium",
              material.quantity > 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {material.quantity > 0 ? "Còn hàng" : "Hết hàng"}
          </div>
          <div className="text-xs text-gray-500">
            Số lượng: {material.quantity} ({material.unit})
          </div>
        </div>
      </div>
    </div>
  ));
};
