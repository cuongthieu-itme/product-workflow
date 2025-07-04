"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { registerInputSchema, RegisterInputType } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoleEnum } from "../constants";
import { useRegisterMutation } from "../hooks";
import { InputCustom } from "@/components/form/input";

export function RegisterPage() {
  const { control, handleSubmit, reset } = useForm<RegisterInputType>({
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: UserRoleEnum.USER,
      userName: "",
    },
    resolver: zodResolver(registerInputSchema),
  });

  const {
    mutate,
    error,
    isPending,
    isSuccess,
    reset: resetMutationState,
  } = useRegisterMutation();

  const onSubmit: SubmitHandler<RegisterInputType> = async (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Đăng ký</CardTitle>
          <CardDescription>
            Tạo tài khoản mới để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Thành công</AlertTitle>
              <AlertDescription>
                Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <InputCustom
                name="userName"
                control={control}
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
              />

              <InputCustom
                name="password"
                control={control}
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                type="password"
              />

              <InputCustom
                name="password"
                control={control}
                label="Mật khẩu"
                placeholder="Xac nhận mật khẩu"
                type="password"
              />

              <InputCustom
                name="fullName"
                control={control}
                label="Họ và tên"
                placeholder="Nhập họ và tên"
              />

              <InputCustom
                name="email"
                control={control}
                label="Email"
                placeholder="Nhập email"
              />

              {/* <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Quản trị</SelectItem>
                    <SelectItem value="sales">Kinh doanh</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="production">Sản xuất</SelectItem>
                    <SelectItem value="rd">Nghiên cứu & Phát triển</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  if (isSuccess) {
                    resetMutationState();
                  }
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang đăng
                    ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
