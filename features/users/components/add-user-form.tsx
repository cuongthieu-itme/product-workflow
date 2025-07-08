"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SubmitHandler, useForm } from "react-hook-form";
import { createUserInputSchema, CreateUserInputType } from "../schema";
import { UserRoleEnum } from "@/features/auth/constants";
import { InputCustom } from "@/components/form/input";
import { KEY_EMPTY_SELECT, SelectCustom, SelectOption } from "@/components/form/select";
import { useCreateUserMutation } from "../hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRoles } from "../options";
import { useResetOnFormChange } from "@/hooks/use-reset-form-change";
import { useDepartmentsQuery } from "@/features/departments/hooks";

export function AddUserForm() {
  const { control, handleSubmit, watch, reset } = useForm<CreateUserInputType>({
    defaultValues: {
      userName: "",
      password: "",
      confirmPassword: "",
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

  const { data: departments, error: departmentError } = useDepartmentsQuery();

  const departOptions: SelectOption[] =
    departments?.data.map((d) => ({
      value: d.id,
      label: d.name,
    })) ?? [];

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
            options={userRoles}
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

          <InputCustom
            control={control}
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            type="password"
            required
          />

          <InputCustom
            control={control}
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            type="password"
            required
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
