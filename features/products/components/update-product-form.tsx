"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { BaseDialog } from "@/components/dialog";
import { updateProductInputSchema, UpdateProductInputType } from "../schema";
import { useUpdateProductMutation } from "../hooks";
import { genderOptions } from "@/features/customers/options";
import { ProductType } from "../types";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

export function UpdateProductForm({
  onCustomerAdded,
  product,
  open,
  onClose,
}: {
  onCustomerAdded?: () => void;
  product: ProductType | null;
  open: boolean;
  onClose: () => void;
}) {
  const { control, handleSubmit, reset } = useForm<UpdateProductInputType>({
    defaultValues: {
      description: product?.description || "",
      id: product?.id || 0,
      name: product?.name || "",
      categoryId: product?.categoryId || null,
    },
    resolver: zodResolver(updateProductInputSchema),
  });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    data,
    reset: resetMutation,
  } = useUpdateProductMutation();

  const onSubmit: SubmitHandler<UpdateProductInputType> = (data) => {
    if (!product?.id) return;

    mutate(data, {
      onSuccess: () => {
        toast("Cập nhật sản phẩm thành công", {
          duration: 5000,
        });
        reset();
        if (onCustomerAdded) {
          onCustomerAdded();
        }
      },
    });
  };

  useEffect(() => {
    resetMutation();
  }, [open]);

  const { data: categories } = useCategoriesQuery();
  const categoryOptions =
    categories?.data.map((category) => ({
      value: category.id,
      label: category.name,
    })) ?? [];

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Cập nhật sản phẩm"
      description="Điền thông tin để cập nhật sản phẩm. Nhấn nút Cập nhật khi hoàn tất."
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
                {data.message || "Sản phẩm đã được cập nhật thành công."}
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
                label="Tên sản phẩm"
                placeholder="Nhập tên sản phẩm"
                required
              />

              <InputCustom
                control={control}
                name="description"
                label="Mô tả"
                placeholder="Nhập mô tả"
                required
              />

              <SelectCustom
                name="categoryId"
                control={control}
                label="Danh mục sản phẩm"
                options={categoryOptions}
                required
                placeholder="Chọn danh mục sản phẩm"
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
                  "Cập nhật sản phẩm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
