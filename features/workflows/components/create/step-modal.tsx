"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createWorkflowInputSchema,
  CreateWorkflowInputType,
  StepInputType,
} from "../../schema/create-workflow-schema";

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
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    defaultValues: {
      steps: [
        editingStep || {
          name: "",
          description: "",
          estimatedDays: 1,
          roleUserEnsure: "",
          notifyBeforeDeadline: 1,
          stepRequired: false,
          stepWithCost: false,
        },
      ],
    },
  });

  const stepRequired = useWatch({ control, name: "steps.0.stepRequired" });
  const stepWithCost = useWatch({ control, name: "steps.0.stepWithCost" });

  const handleSave = (data: CreateWorkflowInputType) => {
    onSave(data.steps[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingStep ? "Chỉnh sửa bước" : "Thêm bước mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
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
            <Button type="submit">
              {editingStep ? "Cập nhật" : "Thêm bước"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
