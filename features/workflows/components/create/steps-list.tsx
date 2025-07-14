"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GripVertical,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFormContext, useFieldArray } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { WorkflowItem } from "./workflow-item";

interface StepsListProps {
  handleOpenStepModal: () => void;
  onRemoveStep: (index: number) => void;
}

export function StepsList({
  handleOpenStepModal,
  onRemoveStep,
}: StepsListProps) {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<CreateWorkflowInputType>();

  const { fields, move, update } = useFieldArray<CreateWorkflowInputType>({
    control,
    name: "subprocesses",
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);

      if (oldIndex >= 0 && newIndex >= 0) {
        move(oldIndex, newIndex);

        fields.forEach((field, index) => {
          update(index, {
            ...field,
            step: index + 1,
          });
        });
      }
    }
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Card
        className={`transition-all duration-200 ${
          errors.subprocesses ? "border-destructive bg-destructive/5" : ""
        }`}
      >
        <CardHeader className="border-b border-border/50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bước thực hiện</h3>
            <Button
              onClick={handleOpenStepModal}
              variant="outline"
              type="button"
            >
              Thêm bước
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <SortableContext items={fields}>
            <div className="space-y-4 h-full">
              {fields.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Không có bước nào
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {getValues("subprocesses").map((step, index) => (
                  <WorkflowItem
                    key={index}
                    data={step}
                    onRemoveStep={() => onRemoveStep(index)}
                    stepIndex={index}
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        </CardContent>

        {errors.subprocesses && (
          <CardFooter className="border-t border-border/50">
            <p className="text-sm text-destructive font-medium text-center w-full pt-2">
              {errors.subprocesses.message}
            </p>
          </CardFooter>
        )}
      </Card>
    </DndContext>
  );
}
