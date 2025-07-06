import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../services";
import { USERS_QUERY_KEY } from "./useUsersQuery";
import type { UpdateUserInputType } from "../schema/update-user-schema";

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserInputType }) =>
            updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });
};
