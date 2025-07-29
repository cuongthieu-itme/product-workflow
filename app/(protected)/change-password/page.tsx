"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputCustom } from "@/components/form";
import { useChangePasswordMutation } from "@/features/auth/hooks";
import {
  changePasswordSchema,
  type ChangePasswordInputType,
} from "@/features/auth/schema";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: changePasswordMutation, isPending } =
    useChangePasswordMutation();

  const form = useForm<ChangePasswordInputType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInputType) => {
    changePasswordMutation(
      {
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Đổi mật khẩu thành công",
          });
          router.push("/dashboard");
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Đổi mật khẩu thất bại",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Đổi mật khẩu lần đầu
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để tiếp
            tục.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputCustom
                name="newPassword"
                control={form.control}
                type="password"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                required
              />

              <InputCustom
                name="confirmPassword"
                control={form.control}
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                required
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
