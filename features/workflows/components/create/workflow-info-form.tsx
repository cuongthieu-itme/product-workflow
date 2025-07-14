"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { format } from "date-fns";

export function WorkflowInfoForm() {
  const {
    formState: { errors },
    control,
  } = useFormContext<CreateWorkflowInputType>();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quy trình</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Phiên bản: 1 | Cập nhật lần cuối: {format(new Date(), "dd/MM/yyyy")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputCustom
          label="Tên quy trình "
          id="name"
          control={control}
          name="name"
          placeholder="Nhập tên quy trình"
          className={errors.name ? "border-destructive" : ""}
        />

        <TextAreaCustom
          label="Mô tả"
          id="description"
          control={control}
          name="description"
          placeholder="Mô tả quy trình"
          className={errors.description ? "border-destructive" : ""}
        />
      </CardContent>
    </Card>
  );
}
