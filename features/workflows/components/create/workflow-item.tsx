import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  DollarSign,
  Edit,
  FileText,
  GripVertical,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubProcessInputType } from "../../schema/create-workflow-schema";
import { StepModalUpdate } from "./step-modal-update";

interface WorkflowItemProps {
  data: SubProcessInputType;
  onRemoveStep: () => void;
  stepIndex: number;
}

export function WorkflowItem({
  data,
  onRemoveStep,
  stepIndex,
}: WorkflowItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: data.id ?? 1,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isUpdateStepModalOpen, setIsUpdateStepModalOpen] = useState(false);

  const handleEditStep = () => {
    setIsUpdateStepModalOpen(true);
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
              title="Kéo để sắp xếp lại"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col items-center justify-center bg-primary/10 rounded-full w-8 h-8">
              <span className="text-sm font-medium">{data.step ?? 1}</span>
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {data.name}
                {data.isRequired && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Bắt buộc
                  </Badge>
                )}
                {data.isStepWithCost && (
                  <Badge
                    variant="outline"
                    className="text-xs font-normal bg-green-50"
                  >
                    <DollarSign className="h-3 w-3 mr-1" /> Chi phí
                  </Badge>
                )}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-1" /> Trường dữ liệu
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleEditStep}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-destructive"
              onClick={onRemoveStep}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mô tả</p>
              <p className="text-sm">{data.description || "Không có mô tả"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Thời gian ước tính
              </p>
              <p className="text-sm">{data.estimatedNumberOfDays} ngày</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" /> Người đảm nhiệm
              </p>
              <p className="text-sm">
                {data.roleOfThePersonInCharge || "Chưa xác định"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepModalUpdate
        stepIndex={stepIndex}
        isOpen={isUpdateStepModalOpen}
        onClose={() => setIsUpdateStepModalOpen(false)}
        handleSaveStep={() => {
          console.log("handleSaveStep");
        }}
        editingStep={data}
      />
    </div>
  );
}
