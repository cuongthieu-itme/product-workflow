import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvatarByFileName,
  getUserProfile,
  updateAvatar,
  updateProfile,
} from "../service";
import { USER_INFO_QUERY_KEY } from "@/features/auth/hooks";

export const CURRENT_USER_QUERY_KEY = "current-user";

export const useGetCurrentUserQuery = () => {
  return useQuery({
    queryKey: [CURRENT_USER_QUERY_KEY],
    queryFn: getUserProfile,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_INFO_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CURRENT_USER_QUERY_KEY],
      });
    },
  });
};

export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_INFO_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CURRENT_USER_QUERY_KEY],
      });
    },
  });
};
