import { CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import React from "react";

interface MaterialTableHeaderProps {
  selectedCount: number;
  totalQuantity: number;
}

export const MaterialTableHeader: React.FC<MaterialTableHeaderProps> = ({
  selectedCount,
  totalQuantity,
}) => (
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
          {selectedCount} vật liệu được chọn • Tổng: {totalQuantity} sản phẩm
        </p>
      </div>
    </div>
  </CardHeader>
);
