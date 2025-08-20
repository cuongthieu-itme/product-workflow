import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MaterialRequestInfo } from "./material-request-info";
import { MaterialRequestForm } from "./material-request-form";

interface MaterialTableRowProps {
  material: any;
  onRemove: (materialId: number) => void;
  onCreateRequest: (materialId: number, requestInput: any) => void;
  onCancelRequest: (materialId: number) => void;
}

export const MaterialTableRow: React.FC<MaterialTableRowProps> = ({
  material,
  onRemove,
  onCreateRequest,
  onCancelRequest,
}) => {
  const [showImportForm, setShowImportForm] = useState(false);

  return (
    <TableRow className="group hover:bg-blue-50/50 transition-colors duration-200">
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
          <span className="font-medium text-gray-800">{material.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="font-semibold text-gray-800">
            {material.quantity}
          </span>
          <span className="text-sm text-gray-500">({material.unit})</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {material.requestInput ? (
          <MaterialRequestInfo
            requestInput={material.requestInput}
            unit={material.unit}
            onCancel={() => onCancelRequest(Number(material.id))}
          />
        ) : showImportForm ? (
          <MaterialRequestForm
            unit={material.unit}
            onCreate={(data) => {
              onCreateRequest(Number(material.id), data);
              setShowImportForm(false);
            }}
            onCancel={() => setShowImportForm(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => setShowImportForm(true)}
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
                onClick={() => onRemove(Number(material.id))}
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
};
