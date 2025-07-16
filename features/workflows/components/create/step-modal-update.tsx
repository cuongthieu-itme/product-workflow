"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWatch, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import React, { useEffect } from "react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { Label } from "@radix-ui/react-label";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { SelectCustom } from "@/components/form/select";
import { SubProcessInputType } from "../../schema/create-workflow-schema";

interface StepModalUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  editingStep?: SubProcessInputType;
  stepIndex: number;
  handleSaveStep: (stepData: SubProcessInputType) => void;
}

export function StepModalUpdate({
  isOpen,
  onClose,
  editingStep,
  stepIndex,
  handleSaveStep,
}: StepModalUpdateProps) {
  const {
    formState: { errors },
    setValue,
    control,
    getValues,
  } = useFormContext<CreateWorkflowInputType>();

  useEffect(() => {
    if (editingStep && stepIndex !== undefined) {
      setValue(`subprocesses.${stepIndex}.name`, editingStep.name);
      setValue(
        `subprocesses.${stepIndex}.description`,
        editingStep.description
      );
      setValue(
        `subprocesses.${stepIndex}.estimatedNumberOfDays`,
        editingStep.estimatedNumberOfDays
      );
      setValue(
        `subprocesses.${stepIndex}.numberOfDaysBeforeDeadline`,
        editingStep.numberOfDaysBeforeDeadline
      );
      setValue(
        `subprocesses.${stepIndex}.roleOfThePersonInCharge`,
        editingStep.roleOfThePersonInCharge
      );
      setValue(`subprocesses.${stepIndex}.isRequired`, editingStep.isRequired);
      setValue(
        `subprocesses.${stepIndex}.isStepWithCost`,
        editingStep.isStepWithCost
      );
      setValue(`subprocesses.${stepIndex}.step`, editingStep.step);
    }
  }, [editingStep, setValue, stepIndex]);

  const stepRequired = useWatch({
    name: `subprocesses.${stepIndex}.isRequired`,
  });
  const stepWithCost = useWatch({
    name: `subprocesses.${stepIndex}.isStepWithCost`,
  });

  const { trigger } = useFormContext<CreateWorkflowInputType>();

  const onSave = async () => {
    // Validate all required fields
    const ok = await trigger(`subprocesses.${stepIndex}`);
    console.log("ok", ok);

    if (ok) {
      // Get all values from the form
      const values = getValues(`subprocesses.${stepIndex}`);

      // Create the step data with proper types
      const stepData: SubProcessInputType = {
        ...values,
        estimatedNumberOfDays: Number(values.estimatedNumberOfDays),
        numberOfDaysBeforeDeadline: Number(values.numberOfDaysBeforeDeadline),
        departmentId: values.departmentId,
        isRequired: Boolean(values.isRequired),
        isStepWithCost: Boolean(values.isStepWithCost),
        step: Number(values.step),
      };

      handleSaveStep(stepData);
      onClose();
    }
  };

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });
  const departmentList =
    departments?.data?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {editingStep ? "Chỉnh sửa bước" : "Thêm bước mới"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" noValidate>
          <InputCustom
            control={control}
            name={`subprocesses.${stepIndex}.name`}
            placeholder="Nhập tên bước"
            className={
              errors.subprocesses?.[stepIndex]?.name ? "border-destructive" : ""
            }
            label="Tên bước"
          />

          <TextAreaCustom
            control={control}
            name={`subprocesses.${stepIndex}.description`}
            placeholder="Mô tả bước"
            className={
              errors.subprocesses?.[stepIndex]?.description
                ? "border-destructive"
                : ""
            }
            label="Mô tả"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputCustom
              type="number"
              control={control}
              name={`subprocesses.${stepIndex}.estimatedNumberOfDays`}
              placeholder="Nhập số ngày ước lượng"
              className={
                errors.subprocesses?.[stepIndex]?.estimatedNumberOfDays
                  ? "border-destructive"
                  : ""
              }
              label="Số ngày ước lượng"
            />
            <InputCustom
              type="number"
              control={control}
              name={`subprocesses.${stepIndex}.numberOfDaysBeforeDeadline`}
              placeholder="Nhập số ngày thông báo trước hạn"
              className={
                errors.subprocesses?.[stepIndex]?.numberOfDaysBeforeDeadline
                  ? "border-destructive"
                  : ""
              }
              label="Thông báo trước hạn (ngày)"
            />
          </div>

          <SelectCustom
            valueType="number"
            control={control}
            name={`subprocesses.${stepIndex}.departmentId`}
            placeholder="Chọn phòng ban"
            options={departmentList}
            className={
              errors.subprocesses?.[stepIndex]?.departmentId
                ? "border-destructive"
                : ""
            }
            label="Phòng ban"
          />

          <InputCustom
            control={control}
            name={`subprocesses.${stepIndex}.roleOfThePersonInCharge`}
            placeholder="Nhập vai trò người đảm bảo"
            className={
              errors.subprocesses?.[stepIndex]?.roleOfThePersonInCharge
                ? "border-destructive"
                : ""
            }
            label="Vai trò người đảm bảo"
          />

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="stepRequired"
                checked={stepRequired}
                onCheckedChange={(checked) =>
                  setValue(`subprocesses.${stepIndex}.isRequired`, checked)
                }
              />
              <Label htmlFor="stepRequired">Bước bắt buộc</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="stepWithCost"
                checked={stepWithCost}
                onCheckedChange={(checked) =>
                  setValue(`subprocesses.${stepIndex}.isStepWithCost`, checked)
                }
              />
              <Label htmlFor="stepWithCost">Bước có chi phí</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onMouseDown={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Hủy bỏ
            </Button>
            <Button type="button" onClick={onSave}>
              {editingStep ? "Cập nhật" : "Thêm bước"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
