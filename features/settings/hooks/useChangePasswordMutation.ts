"use client"

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../service";
import { useToast } from "@/components/ui/use-toast";

export const useChangePasswordMutation = () => {
  const { toast } = useToast()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thay đổi mật khẩu thành công",
        variant: "default",
      })
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error?.message ?? "Đã xảy ra lỗi khi thay đổi mật khẩu",
        variant: "destructive",
      })
    }
  });
};
