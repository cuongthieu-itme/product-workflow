import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialEnum } from "@/features/materials/constants";
import { RequestMaterial } from "@/features/requests/type";
import { Info, Package, Trash2, Wrench } from "lucide-react";

interface MaterialCardProps {
  material: RequestMaterial;
  index: number;
  onDelete?: (id: number) => void;
}

export const MaterialCard = ({ material, onDelete }: MaterialCardProps) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
      {/* Header with Material Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              {material.material.type === MaterialEnum.MATERIAL ? (
                <Package className="h-5 w-5 text-blue-600" />
              ) : (
                <Wrench className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {material.material.name}
            </h3>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="font-mono text-xs">
              {material.material.code}
            </Badge>
            <Badge
              variant={
                material.material.type === MaterialEnum.MATERIAL
                  ? "default"
                  : "secondary"
              }
              className={`${
                material.material.type === MaterialEnum.MATERIAL
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}
            >
              {material.material.type === MaterialEnum.MATERIAL
                ? "Vật liệu"
                : "Phụ kiện"}
            </Badge>
          </div>
        </div>

        <div className="flex-shrink-0 ml-4">
          <Button
            size="sm"
            variant="destructive"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={() => onDelete && onDelete(material.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Description */}
      {material.material.description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {material.material.description}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
            Đơn vị
          </div>
          <div className="text-sm font-semibold text-blue-900">
            {material.material.unit}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
            Số lượng
          </div>
          <div className="text-sm font-semibold text-green-900">
            {(material.quantity || 0).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  );
};
