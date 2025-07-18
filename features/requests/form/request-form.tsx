"use client";

import type React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestInputSchema, RequestInputType } from "../schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useCreateRequestMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dialog";
import { useEffect } from "react";
import { ProductLinks } from "./product-links";
import {
  useCustomerQuery,
  useCustomersQuery,
} from "@/features/customers/hooks";
import { SelectCustom } from "@/components/form/select";
import { UploadFile } from "@/components/common/upload";
import { MaterialSelector } from "./material/material-selector";
import { StatusProduct } from "./status-product";

interface RequestFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export function RequestForm({
  isDialogOpen,
  setIsDialogOpen,
}: RequestFormProps) {
  const { toast } = useToast();

  const methods = useForm<RequestInputType>({
    defaultValues: {
      title: "",
      description: "",
      image: [],
      productLink: [
        {
          url: "",
        },
      ],
    },
    resolver: zodResolver(requestInputSchema),
  });

  const { control, handleSubmit, reset } = methods;

  const { mutate, isPending, isSuccess, error } = useCreateRequestMutation();

  const onSubmit: SubmitHandler<RequestInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        toast({
          title: "Thành công",
          description: "Yêu cầu đã được thêm thành công.",
        });
      },
    });
  };

  const { data: customer } = useCustomersQuery();

  const customerOptions =
    customer?.data.map((c) => ({
      value: c.id,
      label: c.fullName || c.email || "Khách hàng không xác định",
    })) || [];

  useEffect(() => {
    if (isDialogOpen) {
      reset();
    }
  }, [isDialogOpen]);

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      title="Tạo yêu cầu mới"
      description="Điền thông tin để tạo yêu cầu mới. Nhấn nút Tạo yêu cầu khi hoàn tất."
      contentClassName="w-[600px] max-w-[800px] "
    >
      <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Tạo yêu cầu thành công!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Yêu cầu đã được tạo thành công và đã được thêm vào hệ thống.
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

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-4">
                <SelectCustom
                  control={control}
                  name="customerId"
                  label="Khách hàng"
                  options={customerOptions}
                  placeholder="Chọn khách hàng"
                  required
                  disabled={isPending}
                />

                <InputCustom
                  control={control}
                  name="title"
                  label="Tiêu đề"
                  placeholder="Nhập tiêu đề"
                  required
                  disabled={isPending}
                />

                <TextAreaCustom
                  control={control}
                  name="description"
                  label="Chi tiết yêu cầu"
                  placeholder="Nhập chi tiết yêu cầu"
                  required
                  rows={5}
                  disabled={isPending}
                />

                <ProductLinks />

                <UploadFile
                  control={control}
                  name="image"
                  label="Hình ảnh"
                  disabled={isPending}
                />

                <MaterialSelector />

                <StatusProduct />
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
                    "Tạo yêu cầu"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
