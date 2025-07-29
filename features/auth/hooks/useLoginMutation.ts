"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo, loginUser } from "../services";
import { useRouter } from "next/navigation";
import { setAccessTokenToStorage } from "@/utils";
import { USER_INFO_QUERY_KEY } from "./useGetUserInfoQuery";
import { useAtom } from "jotai";
import { authAtom } from "@/atoms";

export const useLoginMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.isFirstLogin) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
      setAccessTokenToStorage(data.accessToken);
      queryClient.prefetchQuery({
        queryKey: [USER_INFO_QUERY_KEY],
        queryFn: getUserInfo,
      });
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};
