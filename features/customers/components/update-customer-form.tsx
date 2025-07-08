"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { UpdateCustomerInputType, updateCustomerInputSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { useUsersQuery } from "@/features/users/hooks";
import { CustomerType, SourceEnum } from "../type";
import { BaseDialog } from "@/components/dialog";
import { useUpdateCustomerMutation } from "../hooks";
import { DatePickerCustom } from "@/components/form/date-picker";
import { GenderEnum } from "@/constants/gender";
import { genderOptions, sourceOptions } from "../options";

export function UpdateCustomerForm({
  onCustomerAdded,
  customer,
  open,
  onClose,
}: {
  onCustomerAdded?: () => void;
  customer: CustomerType | null;
  open: boolean;
  onClose: () => void;
}) {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<UpdateCustomerInputType>({
      defaultValues: {
        id: customer?.id,
        fullName: customer?.fullName || "",
        phoneNumber: customer?.phoneNumber || "",
        email: customer?.email || "",
        gender: customer?.gender,
        dateOfBirth: customer?.dateOfBirth || "",
        source: customer?.source,
      },
      resolver: zodResolver(updateCustomerInputSchema),
    });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    data,
    // reset: resetMutationStatus,
  } = useUpdateCustomerMutation();
  const { data: users } = useUsersQuery();

  const onSubmit: SubmitHandler<UpdateCustomerInputType> = (data) => {
    if (!customer?.id) return;

    mutate(data, {
      onSuccess: () => {
        reset();
        if (onCustomerAdded) {
          onCustomerAdded();
        }
      },
    });
  };

  const userOptions =
    users?.data.map((user) => ({
      value: user.id,
      label: `${user.fullName} (${user.userName})`,
    })) || [];

  // useResetOnFormChange(watch, resetMutationStatus);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Cập nhật khách hàng"
      description="Điền thông tin để cập nhật khách hàng. Nhấn nút Cập nhật khi hoàn tất."
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
                {data.message || "Phòng ban đã được cập nhật thành công."}
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
              />

              <InputCustom
                control={control}
                name="email"
                label="Email"
                placeholder="Nhập email"
                required
              />

              <SelectCustom
                name="gender"
                control={control}
                label="Giới tính"
                options={genderOptions}
                required
                placeholder="Chọn giới tính"
              />

              <DatePickerCustom
                name="dateOfBirth"
                control={control}
                label="Ngày sinh"
                required
              />

              <InputCustom
                control={control}
                name="phoneNumber"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                required
              />

              <SelectCustom
                name="source"
                control={control}
                label="Nguồn khách hàng"
                options={sourceOptions}
                required
                placeholder="Chọn nguồn khách hàng"
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
                  "Cập nhật khách hàng"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
