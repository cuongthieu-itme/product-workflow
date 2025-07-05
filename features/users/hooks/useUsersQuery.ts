import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services";

export const USERS_QUERY_KEY = "users";

export const useUsersQuery = () => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
  });
};
