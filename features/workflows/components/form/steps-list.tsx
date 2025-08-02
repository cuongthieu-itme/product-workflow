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
import { useState } from "react";
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
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { WorkflowItem } from "./workflow-item";
import { BatchAssignModal } from "./batch-assign-modal";
import { AssignmentSummary } from "./assignment-summary";
import { AssignmentWarnings } from "./assignment-warnings";
import { SameAssignList } from "./same-assign-list";
import { Users } from "lucide-react";

interface StepsListProps {
  handleOpenStepModal: () => void;
}

export function StepsList({ handleOpenStepModal }: StepsListProps) {
  const {
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<CreateWorkflowInputType>();

  const { fields, move, update, replace } = useFieldArray<
    CreateWorkflowInputType,
    "subprocesses",
    "fieldId"
  >({
    control,
    name: "subprocesses",
    keyName: "fieldId",
  });

  const [isBatchAssignModalOpen, setIsBatchAssignModalOpen] = useState(false);
  console.log("fields", getValues());

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

    const oldIndex = fields.findIndex((item) => item.fieldId === activeId);
    const newIndex = fields.findIndex((item) => item.fieldId === overId);

    if (oldIndex >= 0 && newIndex >= 0) {
      move(oldIndex, newIndex);

      // Cập nhật lại step cho từng subprocess ngay sau khi move
      const currentSubprocesses = getValues("subprocesses");
      currentSubprocesses.forEach((_, index) => {
        setValue(`subprocesses.${index}.step`, index + 1, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });
    }
  };

  const handleRemoveStep = (index: number) => {
    const newSubprocesses = fields
      .filter((_, i) => i !== index)
      .map((step, i) => ({
        ...step,
        step: i + 1,
      }));

    replace(newSubprocesses);
  };

  return (
    <DndContext
      onDragEnd={onDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <div className="space-y-4">
        <AssignmentWarnings />
        <SameAssignList />
        {/* <AssignmentSummary /> */}

        <Card
          className={`transition-all duration-200 ${
            errors.subprocesses ? "border-destructive bg-destructive/5" : ""
          }`}
        >
          <CardHeader className="border-b border-border/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bước thực hiện</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsBatchAssignModalOpen(true)}
                  variant="outline"
                  type="button"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Assign hàng loạt
                </Button>
                <Button
                  onClick={handleOpenStepModal}
                  variant="outline"
                  type="button"
                >
                  Thêm bước
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <SortableContext
              items={fields.map((item) => item.fieldId)}
              id="subprocesses"
            >
              <div className="space-y-4 h-full">
                {fields.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      Không có bước nào
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {fields.map((step, index) => {
                    const { fieldId, ...rest } = step;

                    return (
                      <WorkflowItem
                        fieldId={fieldId}
                        key={fieldId}
                        data={rest}
                        onRemoveStep={() => handleRemoveStep(index)}
                        onUpdateStep={(data) => update(index, data)}
                      />
                    );
                  })}
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

        <BatchAssignModal
          isOpen={isBatchAssignModalOpen}
          onClose={() => setIsBatchAssignModalOpen(false)}
        />
      </div>
    </DndContext>
  );
}
