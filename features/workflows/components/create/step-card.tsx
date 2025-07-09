"use client";

import { Button } from "@/components/ui/button";
import { Draggable } from "@hello-pangea/dnd";
import { StepInputType } from "../../schema/create-workflow-schema";

interface StepCardProps {
  step: StepInputType;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function StepCard({ step, index, onEdit, onDelete }: StepCardProps) {
  return (
    <Draggable key={step.name} draggableId={step.name} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-medium">Bước {index + 1}</h4>
              <Button variant="outline" size="sm" onClick={() => onEdit(index)}>
                Chỉnh sửa
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
              ✕
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Tên bước:</p>
            <p>{step.name}</p>
            <p className="font-medium">Mô tả:</p>
            <p>{step.description}</p>
            <p className="font-medium">Số ngày ước lượng:</p>
            <p>{step.estimatedDays} ngày</p>
            <p className="font-medium">Vai trò người đảm bảo:</p>
            <p>{step.roleUserEnsure}</p>
            <p className="font-medium">Thông báo trước hạn:</p>
            <p>{step.notifyBeforeDeadline} ngày</p>
            <div className="flex gap-4">
              <p className="font-medium">Bước bắt buộc:</p>
              <p>{step.stepRequired ? "Có" : "Không"}</p>
              <p className="font-medium">Bước có chi phí:</p>
              <p>{step.stepWithCost ? "Có" : "Không"}</p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
