import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../services";
import { USERS_QUERY_KEY } from "./useUsersQuery";

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      // Refetch the users list after successful deletion
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
