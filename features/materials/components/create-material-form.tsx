"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { ImageUpload } from "@/components/common/image-upload";
import { Control, UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/dialog";
import { createMaterialInputSchema, CreateMaterialInputType } from "../schema";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useCreateMaterialMutation } from "../hooks";

export function CreateMaterialForm({
  onCustomerAdded,
}: {
  onCustomerAdded?: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialInputType>({
    defaultValues: {
      code: "",
      name: "",
      count: 0,
      image: [],
      unit: "",
      origin: "",
      description: "",
    },
    resolver: zodResolver(createMaterialInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    reset: resetMutation,
  } = useCreateMaterialMutation();

  const onSubmit: SubmitHandler<CreateMaterialInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
        if (onCustomerAdded) {
          onCustomerAdded();
        }
      },
    });
  };

  const { data: categories } = useCategoriesQuery();
  const categoryOptions =
    categories?.data.map((category) => ({
      value: category.id,
      label: category.name,
    })) ?? [];

  useEffect(() => {
    if (isDialogOpen) {
      reset();
      resetMutation();
    }
  }, [isDialogOpen]);

  return (
    <>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo nguyên liệu
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo nguyên liệu mới"
        description="Điền thông tin để tạo nguyên liệu mới. Nhấn nút Tạo nguyên liệu khi hoàn tất."
        contentClassName="sm:max-w-[400px]"
      >
        <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
          <div className="space-y-6 pr-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-4">
                <ImageUpload
                  name="image"
                  control={control}
                  error={errors.image?.message}
                />
                <InputCustom
                  control={control}
                  name="name"
                  label="Tên nguyên liệu"
                  placeholder="Nhập tên nguyên liệu"
                  required
                  disabled={isPending}
                />

                <InputCustom
                  control={control}
                  name="description"
                  label="Chi tiết nguyên liệu"
                  placeholder="Nhập chi tiết nguyên liệu"
                  required
                  disabled={isPending}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Tạo nguyên liệu"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </BaseDialog>
    </>
  );
}
