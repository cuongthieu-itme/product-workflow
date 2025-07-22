import request from "@/configs/axios-config";
import { RequestInputType, SourceOtherInputType } from "./schema";
import {
  RequestDetail,
  RequestFilterInput,
  RequestsType,
  RequestType,
  SourceOtherFilterInput,
  SourceOthersType,
  RequestChangeStatusInput,
} from "./type";
import { BaseResultQuery } from "@/types/common";
import { omitVoid } from "@/utils/removeParams";

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

export const changeStatusRequest = async ({
  id,
  status,
}: RequestChangeStatusInput) => {
  try {
    const response = await request.put(`/requests/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error changing status request:", error);
    throw error;
  }
};
