import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequest,
  createSourceOther,
  getDetailRequest,
  getRequests,
  getSourceOthers,
  updateRequest,
  changeStatusRequest,
  createEvaluate,
  getEvaluates,
  rejectRequest,
} from "../services";
import {
  EvaluateFilterInput,
  RequestFilterInput,
  SourceOtherFilterInput,
} from "../type";
import { useParams } from "next/navigation";

export enum REQUESTS_QUERY_KEY {
  REQUESTS = "requests",
  SOURCE_OTHERS = "source-others",
  CHANGE_STATUS = "change-status",
  EVALUATES = "evaluates",
}

export const useGetRequestsQuery = (params?: RequestFilterInput) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
    queryFn: () => getRequests(params),
  });
};

export const useGetRequestDetailQuery = () => {
  const { id } = useParams<{ id: string }>();

  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS, id],
    queryFn: () => getDetailRequest(Number(id)),
    enabled: id !== undefined && id !== null,
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

export const useUpdateRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useChangeStatusRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeStatusRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useGetEvaluatesQuery = (params: EvaluateFilterInput) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.EVALUATES, params],
    queryFn: () => getEvaluates(params),
  });
};

export const useCreateEvaluateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvaluate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.EVALUATES],
      });
    },
  });
};

export const useRejectRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};
