import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequest,
  createSourceOther,
  getDetailRequest,
  getRequests,
  getSourceOthers,
} from "../services";
import { RequestFilterInput } from "../type";

export enum REQUESTS_QUERY_KEY {
  REQUESTS = "requests",
  SOURCE_OTHERS = "source-others",
}

export const useGetRequestsQuery = (params?: RequestFilterInput) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
    queryFn: () => getRequests(params),
  });
};

export const useGetRequestDetailQuery = (id: number) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS, id],
    queryFn: () => getDetailRequest(id),
    enabled: !!id,
  });
};

export const useCreateRequestMutation = () => {
  return useMutation({
    mutationFn: createRequest,
  });
};

export const useGetSourceOthersQuery = () => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.SOURCE_OTHERS],
    queryFn: () => getSourceOthers(),
  });
};

export const useCreateSourceOtherMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSourceOther,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.SOURCE_OTHERS],
      });
    },
  });
};
