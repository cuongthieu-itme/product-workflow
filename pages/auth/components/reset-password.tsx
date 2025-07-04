"use client";

import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import {
  resetPasswordInputSchema,
  ResetPasswordInputType,
} from "../schema/reset-password-schema";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "../hooks";

export function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const { control, handleSubmit } = useForm<ResetPasswordInputType>({
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
      token: null,
    },
    resolver: zodResolver(resetPasswordInputSchema),
  });

  const { mutate, isPending, error } = useResetPassword();

  const onSubmit: SubmitHandler<ResetPasswordInputType> = async (data) => {
    if (token) {
      mutate({
        ...data,
        token: String(token),
      });
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md bg-white shadow-lg pt-10">
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                Token không hợp lệ hoặc không có.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập thông tin để đặt lại mật khẩu của bạn
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <InputCustom
                name="newPassword"
                control={control}
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                type="password"
              />

              <InputCustom
                name="confirmPassword"
                control={control}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                type="password"
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Trở về{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
