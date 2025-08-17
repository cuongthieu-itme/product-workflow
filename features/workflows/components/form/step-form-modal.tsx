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
import React, { useEffect, useState } from "react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { SelectCustom } from "@/components/form/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { SwitchCustom } from "@/components/form/switch";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetFieldStep } from "../../hooks/useWorkFlowProcess";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedFields, setSelectedFields] = useState<string[]>(
    data?.checkFields || []
  );

  const { control, handleSubmit, reset, setValue } =
    useForm<SubProcessInputType>({
      defaultValues: {
        id: data?.id || null,
        name: data?.name || "",
        description: data?.description || "",
        estimatedNumberOfDays: data?.estimatedNumberOfDays || 1,
        numberOfDaysBeforeDeadline: data?.numberOfDaysBeforeDeadline || 1,
        roleOfThePersonInCharge: data?.roleOfThePersonInCharge || "",
        departmentId: data?.departmentId,
        isRequired: data?.isRequired || false,
        isStepWithCost: data?.isStepWithCost || false,
        step: data?.step || 1,
        checkFields: data?.checkFields || [],
        isShowRequestMaterial: data?.isShowRequestMaterial || false,
      },
      resolver: zodResolver(subprocessesSchema),
    });

  const onSubmit: SubmitHandler<SubProcessInputType> = (data, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    handleSaveStep(data);
    onClose();
  };

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  const departmentList =
    departments?.data?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) ?? [];

  useEffect(() => {
    if (isOpen) {
      const fieldsData = data?.checkFields || [];
      setSelectedFields(fieldsData);
      reset({
        id: data?.id || null,
        name: data?.name || "",
        description: data?.description || "",
        estimatedNumberOfDays: data?.estimatedNumberOfDays || 1,
        numberOfDaysBeforeDeadline: data?.numberOfDaysBeforeDeadline || 1,
        roleOfThePersonInCharge: data?.roleOfThePersonInCharge || "",
        departmentId: data?.departmentId,
        isRequired: data?.isRequired || false,
        isStepWithCost: data?.isStepWithCost || false,
        step: data?.step || 1,
        checkFields: fieldsData,
        isShowRequestMaterial: data?.isShowRequestMaterial || false,
      });
    }
  }, [isOpen, data, reset]);

  const { data: fields } = useGetFieldStep();

  const handleFieldToggle = (fieldName: string, isChecked: boolean) => {
    let updatedFields: string[];

    if (isChecked) {
      // Thêm field vào mảng nếu chưa có
      updatedFields = selectedFields.includes(fieldName)
        ? selectedFields
        : [...selectedFields, fieldName];
    } else {
      // Xóa field khỏi mảng
      updatedFields = selectedFields.filter((field) => field !== fieldName);
    }

    setSelectedFields(updatedFields);
    setValue("checkFields", updatedFields);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>{data?.id ? "Cập nhật" : "Thêm"} bước mới</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-auto pr-8">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.stopPropagation();
              handleSubmit(onSubmit)(e);
            }}
          >
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
              <SwitchCustom
                name="isShowRequestMaterial"
                control={control}
                label="Hiển thị yêu cầu vật liệu"
              />
            </div>

            {/* Fields Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Chọn các trường dữ liệu
              </Label>
              <div className="space-y-2">
                {fields?.data?.map((fieldItem) => (
                  <div
                    key={fieldItem.value}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      id={`field-${fieldItem.value}`}
                      checked={selectedFields.includes(fieldItem.enumValue)}
                      onCheckedChange={(checked) =>
                        handleFieldToggle(fieldItem.enumValue, checked)
                      }
                    />
                    <Label
                      htmlFor={`field-${fieldItem.value}`}
                      className="text-sm"
                    >
                      {fieldItem.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedFields.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Đã chọn:{" "}
                  {selectedFields
                    .map((fieldName) => {
                      const fieldItem = fields?.data?.find(
                        (item) => item.enumValue === fieldName
                      );
                      return fieldItem?.label || fieldName;
                    })
                    .join(", ")}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button type="submit">
                {data?.id ? "Cập nhật" : "Thêm bước"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
