"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";

export function WorkflowInfoForm() {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên quy trình</Label>
        <InputCustom
          id="name"
          control={control}
          name="name"
          placeholder="Nhập tên quy trình"
          className={errors.name ? "border-destructive" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <TextAreaCustom
          id="description"
          control={control}
          name="description"
          placeholder="Mô tả quy trình"
          className={errors.description ? "border-destructive" : ""}
        />
      </div>
    </div>
  );
}
