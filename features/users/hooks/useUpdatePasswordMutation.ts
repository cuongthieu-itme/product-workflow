import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserPassword } from "../services";
import { USERS_QUERY_KEY } from "./useUsersQuery";
import type { UpdatePasswordInputType } from "../schema";

export const useUpdatePasswordMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePasswordInputType }) =>
            updateUserPassword(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });
};
