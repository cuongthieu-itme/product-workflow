"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkflowInputSchema,
  CreateWorkflowInputType,
  StepInputType,
} from "../../schema/create-workflow-schema";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function CreateWorkflowProcessForm() {
  const { toast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [],
    },
  });

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

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

  console.log(errors, "errors");
  console.log(watch("steps"), "watch");

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

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (data) => {
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workflow Info */}
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

        {/* Steps Section */}
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
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <h4 className="text-sm font-medium">
                                Bước {index + 1}
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStep(index)}
                              >
                                Chỉnh sửa
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveStep(index)}
                            >
                              ✕
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <p className="font-medium">Tên bước:</p>
                            <p>{field.name}</p>
                            <p className="font-medium">Mô tả:</p>
                            <p>{field.description}</p>
                            <p className="font-medium">Số ngày ước lượng:</p>
                            <p>{field.estimatedDays} ngày</p>
                            <p className="font-medium">
                              Vai trò người đảm bảo:
                            </p>
                            <p>{field.roleUserEnsure}</p>
                            <p className="font-medium">Thông báo trước hạn:</p>
                            <p>{field.notifyBeforeDeadline} ngày</p>
                            <div className="flex gap-4">
                              <p className="font-medium">Bước bắt buộc:</p>
                              <p>{field.stepRequired ? "Có" : "Không"}</p>
                              <p className="font-medium">Bước có chi phí:</p>
                              <p>{field.stepWithCost ? "Có" : "Không"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Hủy bỏ
          </Button>
          <Button type="submit">Tạo quy trình</Button>
        </div>
      </form>

      {/* Step Modal */}
      <Dialog open={isStepModalOpen} onOpenChange={setIsStepModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingStepIndex !== null ? "Chỉnh sửa bước" : "Thêm bước mới"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => {
              handleSaveStep(data.steps[0]);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="stepName">Tên bước</Label>
              <Input
                id="stepName"
                placeholder="Nhập tên bước"
                {...register(`steps.0.name`)}
                className={errors.steps?.[0]?.name ? "border-destructive" : ""}
              />
              {errors.steps?.[0]?.name && (
                <p className="text-sm text-destructive">
                  {errors.steps[0].name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepDescription">Mô tả</Label>
              <Input
                id="stepDescription"
                placeholder="Mô tả bước"
                {...register(`steps.0.description`)}
                className={
                  errors.steps?.[0]?.description ? "border-destructive" : ""
                }
              />
              {errors.steps?.[0]?.description && (
                <p className="text-sm text-destructive">
                  {errors.steps[0].description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDays">Số ngày ước lượng</Label>
                <Input
                  id="estimatedDays"
                  type="number"
                  min="1"
                  max="365"
                  {...register(`steps.0.estimatedDays`)}
                  className={
                    errors.steps?.[0]?.estimatedDays ? "border-destructive" : ""
                  }
                />
                {errors.steps?.[0]?.estimatedDays && (
                  <p className="text-sm text-destructive">
                    {errors.steps[0].estimatedDays.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notifyBeforeDeadline">
                  Thông báo trước hạn (ngày)
                </Label>
                <Input
                  id="notifyBeforeDeadline"
                  type="number"
                  min="1"
                  max="365"
                  {...register(`steps.0.notifyBeforeDeadline`)}
                  className={
                    errors.steps?.[0]?.notifyBeforeDeadline
                      ? "border-destructive"
                      : ""
                  }
                />
                {errors.steps?.[0]?.notifyBeforeDeadline && (
                  <p className="text-sm text-destructive">
                    {errors.steps[0].notifyBeforeDeadline.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleUserEnsure">Vai trò người đảm bảo</Label>
              <Input
                id="roleUserEnsure"
                placeholder="Nhập vai trò người đảm bảo"
                {...register(`steps.0.roleUserEnsure`)}
                className={
                  errors.steps?.[0]?.roleUserEnsure ? "border-destructive" : ""
                }
              />
              {errors.steps?.[0]?.roleUserEnsure && (
                <p className="text-sm text-destructive">
                  {errors.steps[0].roleUserEnsure.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="stepRequired"
                  {...register(`steps.0.stepRequired`)}
                />
                <Label htmlFor="stepRequired">Bước bắt buộc</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="stepWithCost"
                  {...register(`steps.0.stepWithCost`)}
                />
                <Label htmlFor="stepWithCost">Bước có chi phí</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStepModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button type="submit">
                {editingStepIndex !== null ? "Cập nhật" : "Thêm bước"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
