import { useMutation, useQuery } from "@tanstack/react-query";
import { createRequest, getDetailRequest, getRequests } from "../services";
import { RequestFilterInput } from "../type";

export enum REQUESTS_QUERY_KEY {
  REQUESTS = "requests",
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
