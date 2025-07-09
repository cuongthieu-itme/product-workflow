"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { UpdateCategoryInputType, updateCategoryInputSchema } from "../schema";
import { useUpdateCategoryMutation } from "../hooks";
import { CategoryType } from "../types";
import { BaseDialog } from "@/components/dialog";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function UpdateCategoryForm({
  onCategoryAdded,
  category,
  open,
  onClose,
}: {
  onCategoryAdded?: () => void;
  category: CategoryType | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<UpdateCategoryInputType>({
    defaultValues: {
      description: category?.description || "",
      id: category?.id || 0,
      name: category?.name || "",
    },
    resolver: zodResolver(updateCategoryInputSchema),
  });

  const { mutate, isPending, isSuccess, error } = useUpdateCategoryMutation();

  const onSubmit: SubmitHandler<UpdateCategoryInputType> = (data) => {
    if (!category?.id) return;

    mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
        toast({
          title: "Thành công",
          description: "Danh mục đã được cập nhật thành công.",
        });
        if (onCategoryAdded) {
          onCategoryAdded();
        }
      },
    });
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Cập nhật danh mục"
      description="Điền thông tin để cập nhật danh mục. Nhấn nút Cập nhật khi hoàn tất."
      contentClassName="sm:max-w-[400px]"
    >
      <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Cập nhật thành công!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Danh mục đã được cập nhật thành công.
              </AlertDescription>
            </Alert>
          )}

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
              <InputCustom
                control={control}
                name="name"
                label="Tên danh mục"
                placeholder="Nhập tên danh mục"
                required
              />

              <InputCustom
                control={control}
                name="description"
                label="Mô tả"
                placeholder="Nhập mô tả"
                required
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
                  "Cập nhật danh mục"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
