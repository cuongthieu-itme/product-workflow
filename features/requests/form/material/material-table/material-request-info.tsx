import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface MaterialRequestInfoProps {
  requestInput: any;
  unit: string;
  onCancel: () => void;
}

export const MaterialRequestInfo: React.FC<MaterialRequestInfoProps> = ({
  requestInput,
  unit,
  onCancel,
}) => (
  <div className="flex flex-col items-center">
    <span className="text-green-500 text-sm">Đã tạo</span>
    <span className="text-xs">
      {requestInput.quantity} {unit}
    </span>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-xs text-blue-500 cursor-help">Chi tiết</div>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-medium">Số lượng:</span>{" "}
              {requestInput.quantity} {unit}
            </p>
            <p>
              <span className="font-medium">Ngày dự kiến:</span>{" "}
              {format(new Date(requestInput.expectedDate), "dd/MM/yyyy")}
            </p>
            {requestInput.supplier && (
              <p>
                <span className="font-medium">Nhà cung cấp:</span>{" "}
                {requestInput.supplier}
              </p>
            )}
            {requestInput.sourceCountry && (
              <p>
                <span className="font-medium">Xuất xứ:</span>{" "}
                {requestInput.sourceCountry}
              </p>
            )}
            {requestInput.price && (
              <p>
                <span className="font-medium">Giá nhập:</span>{" "}
                {requestInput.price.toLocaleString()} VNĐ/{unit}
              </p>
            )}
            {requestInput.reason && (
              <p>
                <span className="font-medium">Lý do:</span>{" "}
                {requestInput.reason}
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
      onClick={onCancel}
    >
      Hủy
    </Button>
  </div>
);
