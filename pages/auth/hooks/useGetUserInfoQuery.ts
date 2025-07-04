"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../services";
import { getAccessTokenFromStorage } from "@/utils";

export const USER_INFO_QUERY_KEY = "user_info";

export const useGetUserInfoQuery = () => {
  const token = getAccessTokenFromStorage();

  return useQuery({
    queryKey: [USER_INFO_QUERY_KEY],
    queryFn: getUserInfo,
    retry: false,
    enabled: !!token,
  });
};
