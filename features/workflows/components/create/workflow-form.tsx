"use client";

import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { StepCard } from "./step-card";
import { StepModal } from "./step-modal";
import {
  createWorkflowInputSchema,
  CreateWorkflowInputType,
  StepInputType,
} from "../../schema/create-workflow-schema";
import { Fragment, useState } from "react";

interface WorkflowFormProps {
  onSubmit: (data: CreateWorkflowInputType) => void;
}

export function WorkflowForm({ onSubmit }: WorkflowFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const handleAddStep = () => {
    setIsStepModalOpen(true);
    setEditingStepIndex(null);
  };

  const handleEditStep = (index: number) => {
    setIsStepModalOpen(true);
    setEditingStepIndex(index);
  };

  const handleSaveStep = (stepData: StepInputType) => {
    if (editingStepIndex !== null) {
      setValue(`steps.${editingStepIndex}`, stepData);
    } else {
      append(stepData);
    }
    setIsStepModalOpen(false);
  };

  const handleRemoveStep = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: "Cảnh báo",
        description: "Phải có ít nhất 1 bước trong quy trình",
        variant: "destructive",
      });
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên quy trình</Label>
            <Input
              id="name"
              placeholder="Nhập tên quy trình"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả quy trình"
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bước thực hiện</h3>
            <Button onClick={handleAddStep} variant="outline">
              Thêm bước
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {fields.map((field, index) => (
                    <StepCard
                      key={field.id}
                      step={field}
                      index={index}
                      onEdit={handleEditStep}
                      onDelete={handleRemoveStep}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Hủy bỏ
          </Button>
          <Button type="submit">Tạo quy trình</Button>
        </div>
      </form>

      <StepModal
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        onSave={handleSaveStep}
        editingStep={
          editingStepIndex !== null ? fields[editingStepIndex] : undefined
        }
      />
    </Fragment>
  );
}
