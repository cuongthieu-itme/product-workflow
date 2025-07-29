"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePassword } from "../service";
import { useToast } from "@/components/ui/use-toast";
import { USER_INFO_QUERY_KEY } from "@/features/auth/hooks";

export const useChangePasswordMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      // Refetch user info to update isFirstLogin status
      queryClient.invalidateQueries({
        queryKey: [USER_INFO_QUERY_KEY],
      });

      // Update user info in cache to set isFirstLogin to false
      queryClient.setQueryData([USER_INFO_QUERY_KEY], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            isFirstLogin: false,
          };
        }
        return oldData;
      });
      toast({
        title: "Thành công",
        description: "Đã thay đổi mật khẩu thành công",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error?.message ?? "Đã xảy ra lỗi khi thay đổi mật khẩu",
        variant: "destructive",
      });
    },
  });
};
