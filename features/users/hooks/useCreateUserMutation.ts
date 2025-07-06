import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../services";
import { USERS_QUERY_KEY } from "./useUsersQuery";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
