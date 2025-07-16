"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  subprocessesSchema,
  SubProcessInputType,
} from "../../schema/create-workflow-schema";
import React, { useEffect } from "react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { SelectCustom } from "@/components/form/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { SwitchCustom } from "@/components/form/switch";

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleSaveStep: (stepData: SubProcessInputType) => void;
  data?: SubProcessInputType;
}

export function StepFormModal({
  isOpen,
  onClose,
  handleSaveStep,
  data,
}: StepModalProps) {
  const { control, handleSubmit, reset } = useForm<SubProcessInputType>({
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      estimatedNumberOfDays: data?.estimatedNumberOfDays || 1,
      numberOfDaysBeforeDeadline: data?.numberOfDaysBeforeDeadline || 1,
      roleOfThePersonInCharge: data?.roleOfThePersonInCharge || "",
      departmentId: data?.departmentId,
      isRequired: data?.isRequired || false,
      isStepWithCost: data?.isStepWithCost || false,
      step: data?.step || 1,
    },
    resolver: zodResolver(subprocessesSchema),
  });

  const onSubmit: SubmitHandler<SubProcessInputType> = (data) => {
    handleSaveStep(data);
  };

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  const departmentList =
    departments?.data?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) ?? [];

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{data?.id ? "Cập nhật" : "Thêm"} bước mới</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <InputCustom
            control={control}
            name="name"
            placeholder="Nhập tên bước"
            label="Tên bước"
          />

          <TextAreaCustom
            control={control}
            name="description"
            placeholder="Mô tả bước"
            label="Mô tả"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputCustom
              type="number"
              control={control}
              name="estimatedNumberOfDays"
              placeholder="Nhập số ngày ước lượng"
              label="Số ngày ước lượng"
            />

            <InputCustom
              type="number"
              control={control}
              name="numberOfDaysBeforeDeadline"
              placeholder="Nhập số ngày thông báo trước hạn"
              label="Thông báo trước hạn (ngày)"
            />
          </div>

          <SelectCustom
            valueType="number"
            control={control}
            name="departmentId"
            placeholder="Chọn phòng ban áp dụng"
            options={departmentList}
            label="Phòng ban"
          />

          <InputCustom
            control={control}
            name="roleOfThePersonInCharge"
            placeholder="Nhập vai trò người đảm bảo"
            label="Vai trò người đảm bảo"
          />

          <div className="flex gap-4">
            <SwitchCustom
              name="isRequired"
              control={control}
              label="Bước bắt buộc"
            />
            <SwitchCustom
              name="isStepWithCost"
              control={control}
              label="Bước có chi phí"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit">{data?.id ? "Cập nhật" : "Thêm bước"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
