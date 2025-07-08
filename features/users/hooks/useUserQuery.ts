import { useQuery } from "@tanstack/react-query";
import { getUser } from "../services";

export const USER_QUERY_KEY = "user";

export const useUserQuery = (id: string) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => getUser(id),
    refetchOnWindowFocus: false,
  });
};
