import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../services";

export const USER_INFO_QUERY_KEY = "user_info";

export const useGetUserInfoQuery = () => {
  return useQuery({
    queryKey: [USER_INFO_QUERY_KEY],
    queryFn: getUserInfo,
    retry: false,
  });
};
