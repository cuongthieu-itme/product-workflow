import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "../service"
import { USER_INFO_QUERY_KEY } from "@/features/auth/hooks"

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [USER_INFO_QUERY_KEY],
            })
        },
    })
}
