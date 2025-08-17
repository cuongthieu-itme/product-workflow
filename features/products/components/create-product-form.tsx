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
import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/dialog";
import { createProductInputSchema, CreateProductInputType } from "../schema";
import { useCreateProductMutation } from "../hooks";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useToast } from "@/components/ui/use-toast";
import { TextAreaCustom } from "@/components/form/textarea";
import { CreateCategoryPopover } from "./create-category-popover";
import { useParams } from "next/navigation";

export function CreateProductForm({
  onCustomerAdded,
}: {
  onCustomerAdded?: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<CreateProductInputType>({
    defaultValues: {
      categoryId: undefined,
      description: "",
      name: "",
      sku: "",
      manufacturingProcess: "",
    },
    resolver: zodResolver(createProductInputSchema),
  });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    reset: resetMutation,
  } = useCreateProductMutation();

  const onSubmit: SubmitHandler<CreateProductInputType> = (data) => {
    mutate(
      {
        ...data,
      },
      {
        onSuccess: () => {
          reset();
          setIsDialogOpen(false);
          toast({
            title: "Thành công",
            description: "Sản phẩm đã được thêm thành công.",
          });
          if (onCustomerAdded) {
            onCustomerAdded();
          }
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const { data: categories } = useCategoriesQuery({ limit: 10000 });
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
        Tạo sản phẩm
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo sản phẩm mới"
        description="Điền thông tin để tạo sản phẩm mới. Nhấn nút Tạo sản phẩm khi hoàn tất."
        contentClassName="sm:max-w-[400px]"
      >
        <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
          <div className="space-y-6 pr-4">
            {isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Tạo sản phẩm thành công!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Sản phẩm đã được tạo thành công và đã được thêm vào hệ thống.
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
                  name="sku"
                  label="Mã sản phẩm"
                  placeholder="Nhập mã sản phẩm"
                  required
                  disabled={isPending}
                />

                <InputCustom
                  control={control}
                  name="name"
                  label="Tên sản phẩm"
                  placeholder="Nhập tên sản phẩm"
                  required
                  disabled={isPending}
                />

                <TextAreaCustom
                  control={control}
                  name="description"
                  label="Chi tiết sản phẩm"
                  placeholder="Nhập chi tiết sản phẩm"
                  required
                  disabled={isPending}
                />

                <TextAreaCustom
                  control={control}
                  name="manufacturingProcess"
                  label="Quy trình sản xuất"
                  placeholder="Nhập quy trình sản xuất"
                  disabled={isPending}
                />

                <div className="flex gap-2 items-end">
                  <SelectCustom
                    valueType="number"
                    name="categoryId"
                    control={control}
                    label="Danh mục sản phẩm"
                    options={categoryOptions}
                    required
                    placeholder="Chọn danh mục sản phẩm"
                    disabled={isPending}
                    emptyOption={{
                      label: "Chọn danh mục sản phẩm",
                    }}
                    containerClassName="flex-1"
                  />

                  <CreateCategoryPopover />
                </div>
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
                    "Tạo sản phẩm"
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
