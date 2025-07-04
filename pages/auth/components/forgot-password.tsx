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
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { InputCustom } from "@/components/form/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { forgotPasswordInputSchema } from "../schema";
import type { ForgotPasswordInput } from "../schema/forgot-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPasswordMutation } from "../hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect } from "react";

export function ForgotPasswordPage() {
  const { control, handleSubmit, reset, watch } = useForm<ForgotPasswordInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    isSuccess,
    data,
    reset: resetMutationState,
  } = useForgotPasswordMutation();

  const onSubmit: SubmitHandler<ForgotPasswordInput> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const email = watch("email");
  useEffect(() => {
    if (email) {
      resetMutationState();
    }
  }, [email, resetMutationState]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để lấy lại mật khẩu
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
                {data.message ||
                  "Yêu cầu đặt lại mật khẩu đã được gửi thành công. Vui lòng kiểm tra email của bạn."}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-3">
              <InputCustom
                control={control}
                name="email"
                type="email"
                placeholder="Nhập email"
                label="Email"
              />
              <Button type="submit" className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  "Gửi yêu cầu đặt lại mật khẩu"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
