import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequest,
  createSourceOther,
  getDetailRequest,
  getRequests,
  getSourceOthers,
} from "../services";
import { RequestFilterInput, SourceOtherFilterInput } from "../type";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useGetSourceOthersQuery = (params: SourceOtherFilterInput) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.SOURCE_OTHERS, params],
    queryFn: () => getSourceOthers(params),
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
