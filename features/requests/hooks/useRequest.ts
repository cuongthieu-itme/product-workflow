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
  holdRequest,
  getSubprocessHistory,
  updateSubprocessHistory,
  updateSubprocessHistorySkip,
  updateMediaRequest,
  assignUserToStep,
  getRequestByProductStatus,
  addMaterialToRequest,
  removeMaterialFromRequest,
  getStatisticsByRequest,
  deleteRequest,
  updateFieldStep,
  approveSubprocessHistory,
  holdSubprocess,
  continueSubprocess,
} from "../services";
import {
  EvaluateFilterInput,
  RequestFilterInput,
  SourceOtherFilterInput,
  SubprocessHistoryFilterInput,
} from "../type";
import { useParams } from "next/navigation";

export enum REQUESTS_QUERY_KEY {
  REQUESTS = "requests",
  SOURCE_OTHERS = "source-others",
  CHANGE_STATUS = "change-status",
  EVALUATES = "evaluates",
  SUBPROCESS_HISTORY = "subprocess-history",
  REQUEST_BY_PRODUCT_STATUS = "request-by-product-status",
}

export const useGetRequestsQuery = (params?: RequestFilterInput) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS, params],
    queryFn: () => getRequests(params),
  });
};

export const useGetRequestDetailQuery = (requestId?: number) => {
  const { id } = useParams<{ id: string }>();
  const queryId = requestId ?? id;

  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS, queryId],
    queryFn: () => getDetailRequest(Number(queryId)),
    enabled: queryId !== undefined && queryId !== null,
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

export const useHoldRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holdRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useGetSubprocessHistoryQuery = (
  params: SubprocessHistoryFilterInput
) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.SUBPROCESS_HISTORY, params],
    queryFn: () => getSubprocessHistory(params),
  });
};

export const useUpdateSubprocessHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubprocessHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useSkipSubprocessHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubprocessHistorySkip,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useUpdateMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useAssignUserToStepMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserToStep,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useGetRequestByProductStatusQuery = (productStatusId: number) => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUESTS, productStatusId],
    queryFn: () => getRequestByProductStatus(productStatusId),
  });
};

export const useAddMaterialToRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMaterialToRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useRemoveMaterialFromRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMaterialFromRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useStatisticsRequestQuery = () => {
  return useQuery({
    queryKey: [REQUESTS_QUERY_KEY.REQUEST_BY_PRODUCT_STATUS],
    queryFn: getStatisticsByRequest,
  });
};

export const useDeleteRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
    },
  });
};

export const useUpdateFieldStepMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFieldStep,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.SUBPROCESS_HISTORY],
      });
    },
  });
};

export const useApproveSubprocessHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveSubprocessHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.SUBPROCESS_HISTORY],
      });
    },
  });
};

export const useHoldSubprocessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: holdSubprocess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.SUBPROCESS_HISTORY],
      });
    },
  });
};

export const useContinueSubprocessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: continueSubprocess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [REQUESTS_QUERY_KEY.SUBPROCESS_HISTORY],
      });
    },
  });
};
