import { verifyUserAccount } from "../services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { USERS_QUERY_KEY } from "./useUsersQuery";

export const useVerifyAccountMutation = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: verifyUserAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });

    return mutation;
};
