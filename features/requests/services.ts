import request from "@/configs/axios-config";
import {
  ConfirmRequestInputType,
  EvaluateInputType,
  HoldRequestInputType,
  MediaInputType,
  RejectRequestInputType,
  RequestInputType,
  SourceOtherInputType,
  SubprocessHistoryFormType,
} from "./schema";
import {
  RequestDetail,
  RequestFilterInput,
  RequestsType,
  SourceOtherFilterInput,
  SourceOthersType,
  EvaluateType,
  EvaluateFilterInput,
  SubprocessHistoryFilterInput,
  SubprocessHistoryType,
  SubprocessHistorySkipInput,
  AssignUserInputType,
  RequestType,
  AddMaterialInputType,
  RemoveMaterialInputType,
  StatusStatisticsType,
} from "./type";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { omitVoid } from "@/utils/removeParams";
import { AnyARecord } from "dns";

export const getRequests = async (params?: RequestFilterInput) => {
  try {
    const response = await request.get<RequestsType>("/requests", {
      params: omitVoid(params),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};

export const getDetailRequest = async (id: number) => {
  try {
    const response = await request.get<BaseResultQuery<RequestDetail>>(
      `/requests/${id}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    throw error;
  }
};

export const createRequest = async (data: RequestInputType) => {
  try {
    const response = await request.post("/requests", {
      ...data,
      productLink: data.productLink.map((link) => link.url),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

export const getSourceOthers = async (params: SourceOtherFilterInput) => {
  try {
    const response = await request.get<SourceOthersType>("/source-others", {
      params: omitVoid(params),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching source others:", error);
    throw error;
  }
};

export const createSourceOther = async (data: SourceOtherInputType) => {
  try {
    const response = await request.post("/source-others", data);
    return response.data;
  } catch (error) {
    console.error("Error creating source other:", error);
    throw error;
  }
};

export const updateRequest = async ({
  id,
  ...data
}: RequestInputType & { id: number }) => {
  try {
    const response = await request.put(`/requests/${id}`, {
      ...data,
      productLink: data.productLink.map((link) => link.url),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating request:", error);
    throw error;
  }
};

export const updateMediaRequest = async ({ id, media }: MediaInputType) => {
  try {
    const response = await request.put(`/requests/${id}`, { media });
    return response.data;
  } catch (error) {
    console.error("Error updating media request:", error);
    throw error;
  }
};

export const changeStatusRequest = async ({
  id,
  ...data
}: ConfirmRequestInputType) => {
  try {
    const response = await request.put(`/requests/${id}/status`, { ...data });
    return response.data;
  } catch (error) {
    console.error("Error changing status request:", error);
    throw error;
  }
};

export const rejectRequest = async ({
  id,
  ...data
}: RejectRequestInputType) => {
  try {
    const response = await request.put(
      `/requests/${id}/status`,
      omitVoid(data)
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

export const holdRequest = async ({ id, ...data }: HoldRequestInputType) => {
  try {
    const response = await request.put(
      `/requests/${id}/status`,
      omitVoid(data)
    );
    return response.data;
  } catch (error) {
    console.error("Error holding request:", error);
    throw error;
  }
};

export const getEvaluates = async (params: EvaluateFilterInput) => {
  try {
    const response = await request.get<PaginatedResult<"data", EvaluateType>>(
      "/evaluates",
      {
        params: omitVoid(params),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching evaluates:", error);
    throw error;
  }
};

export const createEvaluate = async (data: EvaluateInputType) => {
  try {
    const response = await request.post("/evaluates", data);
    return response.data;
  } catch (error) {
    console.error("Error creating evaluate:", error);
    throw error;
  }
};

export const getSubprocessHistory = async (
  params: SubprocessHistoryFilterInput
) => {
  try {
    const response = await request.get<
      PaginatedResult<"data", SubprocessHistoryType>
    >("/subprocesses-history", {
      params: omitVoid(params),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subprocess history:", error);
    throw error;
  }
};

export const updateSubprocessHistory = async ({
  id,
  ...data
}: SubprocessHistoryFormType) => {
  try {
    const response = await request.put(`/subprocesses-history/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating subprocess history:", error);
    throw error;
  }
};

export const updateSubprocessHistorySkip = async ({
  id,
  ...data
}: SubprocessHistorySkipInput) => {
  try {
    const response = await request.put(`/subprocesses-history/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating subprocess history:", error);
    throw error;
  }
};

export const assignUserToStep = async ({
  id,
  ...data
}: AssignUserInputType) => {
  try {
    const response = await request.put<BaseResultQuery<SubprocessHistoryType>>(
      `/subprocesses-history/${id}`,
      omitVoid(data)
    );
    return response.data.data;
  } catch (error) {
    console.error("Error assigning user to step:", error);
    throw error;
  }
};

export const getRequestByProductStatus = async (productStatusId: number) => {
  try {
    const response = await request.get<BaseResultQuery<RequestType[]>>(
      `/requests/by-status-product/${productStatusId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching request by product status ID:", error);
    throw error;
  }
};

export const addMaterialToRequest = async ({
  id,
  materialId,
  quantity,
}: AddMaterialInputType) => {
  try {
    const response = await request.post(`/requests/${id}/material`, {
      materialId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding material to request:", error);
    throw error;
  }
};

export const removeMaterialFromRequest = async ({
  id,
  materialId,
}: RemoveMaterialInputType) => {
  try {
    const response = await request.delete(`/requests/${id}/material`, {
      data: { materialRequestId: materialId },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing material from request:", error);
    throw error;
  }
};

export const getStatisticsByRequest = async () => {
  try {
    const response = await request.get<StatusStatisticsType>(
      "/requests/statistics-by-status/current"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching statistics by request:", error);
    throw error;
  }
};

export const deleteRequest = async (requestId: number) => {
  try {
    const response = await request.delete(`/requests/${requestId}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFieldStep = async ({ id, ...data }: any) => {
  try {
    const response = await request.put<BaseResultQuery<SubprocessHistoryType>>(
      `/field-subprocess/${id}`,
      omitVoid(data)
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating field step:", error);
    throw error;
  }
};
