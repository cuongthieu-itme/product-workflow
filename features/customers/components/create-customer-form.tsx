"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { createCustomerInputSchema, CreateCustomerInputType } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCustomerMutation } from "../hooks";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { SourceEnum } from "../type";
import { GenderEnum } from "@/constants/gender";
import { DatePickerCustom } from "@/components/form/date-picker";
import { genderOptions, sourceOptions } from "../options";
import { useToast } from "@/components/ui/use-toast";

export function CreateCustomerForm({
  onCustomerAdded,
}: {
  onCustomerAdded?: () => void;
}) {
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState } =
    useForm<CreateCustomerInputType>({
      defaultValues: {
        dateOfBirth: "",
        email: "",
        fullName: "",
        gender: GenderEnum.MALE,
        phoneNumber: "",
        source: SourceEnum.WEBSITE,
      },
      resolver: zodResolver(createCustomerInputSchema),
    });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    reset: resetMutationStatus,
  } = useCreateCustomerMutation();

  const onSubmit: SubmitHandler<CreateCustomerInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Khách hàng đã được tạo thành công.",
        });
        reset();
        if (onCustomerAdded) {
          onCustomerAdded();
        }
      },
    });
  };

  return (
    <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
      <div className="space-y-6 pr-4">
        {isSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Tạo khách hàng thành công!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Khách hàng đã được tạo thành công và đã được thêm vào hệ thống.
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
              name="fullName"
              label="Họ Tên"
              placeholder="Nhập họ tên"
              required
              disabled={isPending}
            />

            <InputCustom
              control={control}
              name="email"
              label="Email"
              placeholder="Nhập email"
              required
              disabled={isPending}
            />

            <SelectCustom
              name="gender"
              control={control}
              label="Giới tính"
              options={genderOptions}
              required
              placeholder="Chọn giới tính"
              disabled={isPending}
            />

            <DatePickerCustom
              name="dateOfBirth"
              control={control}
              label="Ngày sinh"
              required
              disabled={isPending}
            />

            <InputCustom
              control={control}
              name="phoneNumber"
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              required
              disabled={isPending}
            />

            <SelectCustom
              name="source"
              control={control}
              label="Nguồn khách hàng"
              options={sourceOptions}
              required
              placeholder="Chọn nguồn khách hàng"
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
                "Tạo khách hàng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </ScrollArea>
  );
}
