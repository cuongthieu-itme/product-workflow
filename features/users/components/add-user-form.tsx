"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { createUserInputSchema, CreateUserInputType } from "../schema";
import { UserRoleEnum } from "@/features/auth/constants";
import { InputCustom } from "@/components/form/input";
import {
  KEY_EMPTY_SELECT,
  SelectCustom,
  SelectOption,
} from "@/components/form/select";
import { useCreateUserMutation } from "../hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRoles } from "../options";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { useGetUserInfoQuery } from "@/features/auth/hooks";

export function AddUserForm() {
  const { control, handleSubmit, reset } = useForm<CreateUserInputType>({
    defaultValues: {
      userName: "",
      fullName: "",
      email: "",
      role: UserRoleEnum.USER,
      departmentId: KEY_EMPTY_SELECT,
      phoneNumber: "",
    },
    resolver: zodResolver(createUserInputSchema),
  });

  const { mutate, isPending, error, isSuccess } = useCreateUserMutation();

  const onSubmit: SubmitHandler<CreateUserInputType> = async (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const { data: departments, error: departmentError } = useDepartmentsQuery({
    limit: 10000,
  });

  const departOptions: SelectOption[] =
    departments?.data.map((d) => ({
      value: d.id,
      label: d.name,
    })) ?? [];

  const { data: user } = useGetUserInfoQuery();

  const selectUserOptions: SelectOption[] =
    user?.role === UserRoleEnum.SUPER_ADMIN
      ? userRoles
      : userRoles.filter((r) => r.value !== UserRoleEnum.ADMIN);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {departmentError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{departmentError.message}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Thành công!</AlertTitle>
          <AlertDescription className="text-green-700">
            Tài khoản đã được tạo thành công.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            disabled={isPending}
            control={control}
            name="fullName"
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="userName"
            label="Tên đăng nhập"
            placeholder="username"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="email"
            label="Email"
            placeholder="name@example.com"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="phoneNumber"
            label="Số điện thoại"
            placeholder="0912345678"
          />

          <SelectCustom
            control={control}
            disabled={isPending}
            name="role"
            label="Vai trò"
            options={selectUserOptions}
            placeholder="Chọn vai trò"
            required
          />

          <SelectCustom
            valueType="number"
            control={control}
            name="departmentId"
            label="Phòng ban"
            options={departOptions}
            emptyOption={{ label: "Không có phòng ban" }}
            placeholder="Chọn phòng ban"
            required
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang tạo..." : "Tạo người dùng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
