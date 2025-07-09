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
import { KEY_EMPTY_SELECT, SelectCustom } from "@/components/form/select";
import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/dialog";
import {
  createProductStatusInputSchema,
  CreateProductStatusInputType,
} from "../schema";
import { useCreateProductStatusMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";
import { ChooseColorProductStatus } from "./choose-color-product-status";

export function CreateProductStatusForm({
  onCustomerAdded,
}: {
  onCustomerAdded?: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset, watch, formState } =
    useForm<CreateProductStatusInputType>({
      defaultValues: {
        color: "#4f46e5",
        name: "",
        description: "",
        procedure: KEY_EMPTY_SELECT,
      },
      resolver: zodResolver(createProductStatusInputSchema),
    });

  const { mutate, isPending, isSuccess, error } =
    useCreateProductStatusMutation();

  const onSubmit: SubmitHandler<CreateProductStatusInputType> = (data) => {
    mutate(data, {
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
    });
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo sản phẩm trạng thái
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo sản phẩm trạng thái mới"
        description="Điền thông tin để tạo sản phẩm trạng thái mới. Nhấn nút Tạo sản phẩm khi hoàn tất."
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
                  name="procedure"
                  control={control}
                  label="Quy trình"
                  emptyOption={{
                    label: "Chọn quy trình",
                  }}
                  options={[
                    { value: "11111", label: "Quy trình 1" },
                    { value: "22222", label: "Quy trình 2" },
                    { value: "33333", label: "Quy trình 3" },
                  ]}
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
                    "Tạo sản phẩm trạng thái"
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
