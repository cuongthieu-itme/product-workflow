import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo, loginUser } from "../services";
import { useRouter } from "next/navigation";
import { setAccessTokenToStorage } from "@/utils";
import { USER_INFO_QUERY_KEY } from "./useGetUserInfoQuery";
import { useAtom } from "jotai";
import { authAtom } from "@/atoms";

export const useLoginMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useAtom(authAtom);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      router.push("/dashboard");
      console.log("Login successful:", data);
      setAccessTokenToStorage(data.accessToken);
      queryClient.prefetchQuery({
        queryKey: [USER_INFO_QUERY_KEY],
        queryFn: getUserInfo,
      });
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};
