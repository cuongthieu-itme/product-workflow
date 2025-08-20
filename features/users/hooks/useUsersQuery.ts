import { useQuery } from "@tanstack/react-query";
import { getUser, getUserNoDepartments, getUsers } from "../services";
import { UserFilterInput } from "../type";

export const USERS_QUERY_KEY = "users";
export const USERS_QUERY_KEY_NO_DEPARTMENTS = "users-no-departments";

export const useUsersQuery = (data?: UserFilterInput) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, data],
    queryFn: () => getUsers(data),
    refetchOnWindowFocus: false,
  });
};

export const useGetUserNoDepartmentsQuery = () => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY_NO_DEPARTMENTS],
    queryFn: getUserNoDepartments,
  });
};
