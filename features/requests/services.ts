import request from "@/configs/axios-config";
import { RequestInputType } from "./schema";
import { RequestFilterInput, RequestsType, RequestType } from "./type";
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
    const response = await request.get<BaseResultQuery<RequestType>>(
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
    const response = await request.post("/requests", data);
    return response.data;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};
