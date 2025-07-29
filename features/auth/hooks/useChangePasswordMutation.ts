"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePassword } from "../services";
import { USER_INFO_QUERY_KEY } from "./useGetUserInfoQuery";

export const useChangePasswordMutation = () => {
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
    },
  });
};
