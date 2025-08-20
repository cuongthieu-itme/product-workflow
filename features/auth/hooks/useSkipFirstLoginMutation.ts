"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { skipFirstLogin } from "../services";
import { USER_INFO_QUERY_KEY } from "./useGetUserInfoQuery";

export const useSkipFirstLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skipFirstLogin,
    onSuccess: () => {
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
