import request from "@/configs/axios-config";
import { omitVoid } from "@/utils/removeParams";
import { BaseResultQuery } from "@/types/common";
import {
  CreateProductStatusInputType,
  UpdateProductStatusInputType,
} from "./schema";
import {
  ProductStatusType,
  ProductStatusFilterInput,
  ProductsType,
} from "./types";

const PREFIX_API = "status-products";

export const getProductsStatus = async (params?: ProductStatusFilterInput) => {
  try {
    const response = await request.get<ProductsType>(`${PREFIX_API}`, {
      params: omitVoid(params),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProductStatus = async (
  data: CreateProductStatusInputType
) => {
  try {
    const response = await request.post<ProductStatusType>(`${PREFIX_API}`, {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProductStatus = async (
  data: UpdateProductStatusInputType
) => {
  const { id, ...requestBody } = data;
  try {
    const response = await request.put(
      `${PREFIX_API}/${id}`,
      omitVoid(requestBody)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductStatus = async (id: string) => {
  try {
    const response = await request.get<BaseResultQuery<ProductStatusType>>(
      `${PREFIX_API}/${id}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProductStatus = async (id: number) => {
  try {
    const response = await request.delete(`${PREFIX_API}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
