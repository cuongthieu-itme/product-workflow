"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CreateWorkflowInputType,
  StepInputType,
} from "../../schema/create-workflow-schema";
import { useFormContext } from "react-hook-form";
import React from "react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { Label } from "@radix-ui/react-label";

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: StepInputType) => void;
  editingStep?: StepInputType;
}

export function StepModal({
  isOpen,
  onClose,
  onSave,
  editingStep,
}: StepModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    control,
  } = useFormContext<CreateWorkflowInputType>();

  React.useEffect(() => {
    if (editingStep) {
      setValue("steps.0.name", editingStep.name);
      setValue("steps.0.description", editingStep.description);
      setValue("steps.0.estimatedDays", editingStep.estimatedDays);
      setValue(
        "steps.0.notifyBeforeDeadline",
        editingStep.notifyBeforeDeadline
      );
      setValue("steps.0.roleUserEnsure", editingStep.roleUserEnsure);
      setValue("steps.0.stepRequired", editingStep.stepRequired);
      setValue("steps.0.stepWithCost", editingStep.stepWithCost);
    }
  }, [editingStep, setValue]);

  const stepRequired = useWatch({ name: "steps.0.stepRequired" });
  const stepWithCost = useWatch({ name: "steps.0.stepWithCost" });

  const handleSave = handleSubmit((data: CreateWorkflowInputType) => {
    onSave(data.steps[0]);
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {editingStep ? "Chỉnh sửa bước" : "Thêm bước mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <InputCustom
            control={control}
            name="steps.0.name"
            placeholder="Nhập tên bước"
            className={errors.steps?.[0]?.name ? "border-destructive" : ""}
            label="Tên bước"
          />

          <TextAreaCustom
            control={control}
            name="steps.0.description"
            placeholder="Mô tả bước"
            className={
              errors.steps?.[0]?.description ? "border-destructive" : ""
            }
            label="Mô tả"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputCustom
              control={control}
              name="steps.0.estimatedDays"
              placeholder="Nhập số ngày ước lượng"
              className={
                errors.steps?.[0]?.estimatedDays ? "border-destructive" : ""
              }
              label="Số ngày ước lượng"
            />
            <InputCustom
              control={control}
              name="steps.0.notifyBeforeDeadline"
              placeholder="Nhập số ngày thông báo trước hạn"
              className={
                errors.steps?.[0]?.notifyBeforeDeadline
                  ? "border-destructive"
                  : ""
              }
              label="Thông báo trước hạn (ngày)"
            />
          </div>

          <InputCustom
            control={control}
            name="steps.0.roleUserEnsure"
            placeholder="Nhập vai trò người đảm bảo"
            className={
              errors.steps?.[0]?.roleUserEnsure ? "border-destructive" : ""
            }
            label="Vai trò người đảm bảo"
          />

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="stepRequired"
                checked={stepRequired}
                onCheckedChange={(checked) =>
                  setValue(`steps.0.stepRequired`, checked)
                }
              />
              <Label htmlFor="stepRequired">Bước bắt buộc</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="stepWithCost"
                checked={stepWithCost}
                onCheckedChange={(checked) =>
                  setValue(`steps.0.stepWithCost`, checked)
                }
              />
              <Label htmlFor="stepWithCost">Bước có chi phí</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={() => {
                const formData = {
                  name: watch("steps.0.name"),
                  description: watch("steps.0.description"),
                  estimatedDays: watch("steps.0.estimatedDays"),
                  notifyBeforeDeadline: watch("steps.0.notifyBeforeDeadline"),
                  roleUserEnsure: watch("steps.0.roleUserEnsure"),
                  stepRequired: stepRequired,
                  stepWithCost: stepWithCost,
                };
                onSave(formData);
              }}
            >
              {editingStep ? "Cập nhật" : "Thêm bước"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
