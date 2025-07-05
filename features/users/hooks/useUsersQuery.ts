import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services";
import { UserFilterInput } from "../type";

export const USERS_QUERY_KEY = "users";

export const useUsersQuery = (data?: UserFilterInput) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, data],
    queryFn: () => getUsers(data),
    refetchOnWindowFocus: false,
  });
};
