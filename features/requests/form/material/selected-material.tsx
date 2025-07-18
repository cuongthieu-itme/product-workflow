import { MaterialType } from "@/features/materials/type";

export const SelectedMaterial = ({
  selectedMaterial,
  materialCount,
}: {
  selectedMaterial?: MaterialType | null;
  materialCount: number;
}) => {
  if (!selectedMaterial) return null;

  return (
    selectedMaterial && (
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-sm font-medium text-blue-900">
          Đã chọn: {selectedMaterial.name}
        </div>
        <div className="text-xs text-blue-700">
          Mã: {selectedMaterial.code} | Số lượng: {materialCount} (
          {selectedMaterial.unit})
        </div>
      </div>
    )
  );
};
