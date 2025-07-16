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
import {
  updateProductStatusInputSchema,
  UpdateProductStatusInputType,
} from "../schema";
import { useUpdateProductStatusMutation } from "../hooks";
import { ProductStatusType } from "../types";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChooseColorProductStatus } from "./choose-color-product-status";
import { useWorkFlowProcessesQuery } from "@/features/workflows/hooks";

export function UpdateProductStatusForm({
  onCustomerAdded,
  product,
  open,
  onClose,
}: {
  onCustomerAdded?: () => void;
  product: ProductStatusType | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { control, handleSubmit, reset } =
    useForm<UpdateProductStatusInputType>({
      defaultValues: {
        description: product?.description || "",
        id: product?.id || 0,
        name: product?.name || "",
        color: product?.color || "#4f46e5",
        procedureId: product?.procedure?.id,
      },
      resolver: zodResolver(updateProductStatusInputSchema),
    });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    data,
    reset: resetMutation,
  } = useUpdateProductStatusMutation();

  const onSubmit: SubmitHandler<UpdateProductStatusInputType> = (data) => {
    if (!product?.id) return;

    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Sản phẩm đã được cập nhật thành công.",
        });
        reset();
        onClose();
        if (onCustomerAdded) {
          onCustomerAdded();
        }
      },
    });
  };

  useEffect(() => {
    resetMutation();
    reset();
  }, [open]);

  const { data: procedures } = useWorkFlowProcessesQuery({
    limit: 1000,
  });

  const proceduresOptions =
    procedures?.data?.map((p) => ({
      value: p.id,
      label: p.name,
    })) ?? [];

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Cập nhật sản phẩm trạng thái"
      description="Điền thông tin để cập nhật sản phẩm trạng thái. Nhấn nút Cập nhật khi hoàn tất."
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
                label="Tên"
                placeholder="Nhập tên"
                required
                disabled={isPending}
              />

              <InputCustom
                control={control}
                name="description"
                label="Chi tiết"
                placeholder="Nhập chi tiết"
                required
                disabled={isPending}
              />

              <ChooseColorProductStatus control={control} name="color" />

              <SelectCustom
                name="procedureId"
                control={control}
                label="Quy trình"
                emptyOption={{
                  label: "Chọn quy trình",
                }}
                options={proceduresOptions}
                required
                placeholder="Chọn quy trình"
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
                  "Cập nhật trạng thái sản phẩm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
