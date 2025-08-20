import { Card, CardContent } from "@/components/ui/card";
import { RequestInputType } from "@/features/requests/schema";
import { Package } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";

export const MaterialTableEmpty: React.FC = () => {
  const {
    formState: { errors },
  } = useFormContext<RequestInputType>();

  return (
    <div className="flex flex-col gap-2">
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
      {errors.materials && (
        <p className="text-red-500 text-sm">{errors.materials.message}</p>
      )}
    </div>
  );
};
