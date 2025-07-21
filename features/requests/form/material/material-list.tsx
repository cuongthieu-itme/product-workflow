import { MaterialEnum } from "@/features/materials/constants";
import { MaterialType } from "@/features/materials/type";
import { cn } from "@/lib/utils";

interface MaterialListProps {
  materials: MaterialType[];
  selectedMaterialId: number | null;
  handleMaterialSelect: (material: MaterialType) => void;
}

export const MaterialList = ({
  materials,
  selectedMaterialId,
  handleMaterialSelect,
}: MaterialListProps) => {
  if (!materials || materials.length === 0) {
    return <div className="p-4 text-gray-500">Không có vật liệu nào.</div>;
  }

  return materials?.map((material) => (
    <div
      key={material.id}
      className={cn(
        "p-3 cursor-pointer hover:bg-gray-100 transition-colors",
        selectedMaterialId === material.id
          ? "bg-blue-50 border-l-4 border-blue-500"
          : ""
      )}
      onClick={() => handleMaterialSelect(material)}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{material.name}</div>
          <div className="text-sm text-gray-500">
            Mã: {material.code} | Đơn vị: {material.unit}
          </div>
          {material.description && (
            <div className="text-xs text-gray-400 mt-1">
              {material.description}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Xuất xứ: {material.origin.name} | Loại:{" "}
            {material.type === MaterialEnum.ACCESSORY
              ? "Phụ kiện"
              : "Nguyên liệu"}
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
            SL: {material.quantity} {material.unit}
          </div>
        </div>
      </div>
    </div>
  ));
};
