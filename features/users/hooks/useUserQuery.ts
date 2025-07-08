import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services";
import { UserFilterInput } from "../type";

export const USER_QUERY_KEY = "user";

export const useUsersQuery = (data?: UserFilterInput) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, data],
    queryFn: () => getUsers(data),
    refetchOnWindowFocus: false,
  });
};
