"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useFormContext, useFieldArray, Control } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
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
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreateWorkflowInputType>();

  const { fields } = useFieldArray<CreateWorkflowInputType>({
    control,
    name: "subprocesses",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!over || activeId === overId) return;

    const oldIndex = fields.findIndex((item) => item.id === activeId);
    const newIndex = fields.findIndex((item) => item.id === overId);

    if (oldIndex >= 0 && newIndex >= 0) {
      // Update fields using arrayMove
      const newFields = arrayMove(fields, oldIndex, newIndex);

      // Update step numbers
      const updatedFields = newFields.map((field, index) => ({
        ...field,
        step: index + 1,
      }));

      // Update form values
      setValue("subprocesses", updatedFields, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Debug log
      console.log("Drag end:", {
        activeId,
        overId,
        oldIndex,
        newIndex,
        fields: updatedFields.map((f) => f.id),
      });
    }
  };

  return (
    <DndContext
      onDragEnd={onDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
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
          <SortableContext items={fields} id="subprocesses">
            <div className="space-y-4 h-full">
              {fields.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Không có bước nào
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {fields.map((step, index) => (
                  <WorkflowItem
                    key={step.id}
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
