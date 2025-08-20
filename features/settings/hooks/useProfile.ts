import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getAvatarByFileName,
  getNotificationSettings,
  getUserProfile,
  markAsReadNotification,
  updateAvatar,
  updateProfile,
} from "../service";
import { USER_INFO_QUERY_KEY } from "@/features/auth/hooks";

export const CURRENT_USER_QUERY_KEY = "current-user";
export enum SETTING_QUERY_KEY {
  NOTIFICATION = "notification",
}

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

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: [SETTING_QUERY_KEY.NOTIFICATION],
    queryFn: () => getNotificationSettings(1, 10),
  });
};

export const useInfiniteNotificationsQuery = () => {
  return useInfiniteQuery({
    queryKey: [SETTING_QUERY_KEY.NOTIFICATION, "infinite"],
    queryFn: ({ pageParam = 1 }) => getNotificationSettings(pageParam, 10),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / 10);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsReadNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SETTING_QUERY_KEY.NOTIFICATION],
      });
      queryClient.invalidateQueries({
        queryKey: [SETTING_QUERY_KEY.NOTIFICATION, "infinite"],
      });
    },
  });
};
