"use client";
import React from "react";
import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/form/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useForm, SubmitHandler, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordInputSchema, UpdatePasswordInputType } from "../schema";
import { useUpdatePasswordMutation } from "../hooks";
import type { User } from "../type";

interface PasswordDialogProps {
  resetPasswordUser: User | null;
  setResetPasswordUser: (user: User | null) => void;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  resetPasswordUser,
  setResetPasswordUser,
}) => {
  const { toast } = useToast();

  const {
    mutate,
    isPending,
  } = useUpdatePasswordMutation();

  const { control, handleSubmit, reset } = useForm<UpdatePasswordInputType>({
    defaultValues: { password: "" },
    resolver: zodResolver(updatePasswordInputSchema),
  });

  const onSubmit: SubmitHandler<UpdatePasswordInputType> = (data) => {
    if (!resetPasswordUser) return;
    mutate(
      { id: resetPasswordUser.id, data },
      {
        onSuccess: () => {
          toast({ title: "Thành công", description: "Mật khẩu đã được cập nhật." });
          reset();
          setResetPasswordUser(null);
        },
        onError: (error: any) => {
          toast({ title: "Lỗi", description: error?.message || "Có lỗi xảy ra" });
        },
      }
    );
  };
  return (
    <BaseDialog
      title="Đặt lại mật khẩu"
      open={!!resetPasswordUser}
      onClose={() => { reset(); setResetPasswordUser(null); }}
      contentClassName="sm:max-w-[425px]"
      description={`Đặt lại mật khẩu cho người dùng ${resetPasswordUser?.userName || ""}`}
      footer={
        <Button type="submit" disabled={isPending} form="password-dialog-form">
          {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
      }
    >
      <form
        id="password-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <InputCustom
          label="Mật khẩu mới"
          control={control}
          name="password"
          type="password"
          disabled={isPending}
          placeholder="Nhập mật khẩu mới"
          required

        />

      </form>
    </BaseDialog>
  );
};
