import request from "@/configs/axios-config";
import { omitVoid } from "@/utils/removeParams";
import { BaseResultQuery } from "@/types/common";
import { CreateProductInputType, UpdateProductInputType } from "./schema";
import { ProductType, ProductFilterInput, ProductsType } from "./types";

export const getProducts = async (params?: ProductFilterInput) => {
  try {
    const response = await request.get<ProductsType>("/products", {
      params: omitVoid(params),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (data: CreateProductInputType) => {
  try {
    const response = await request.post<ProductType>("/products", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (data: UpdateProductInputType) => {
  const { id, ...requestBody } = data;
  try {
    const response = await request.put(
      `/customers/${id}`,
      omitVoid(requestBody)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await request.get<BaseResultQuery<ProductType>>(
      `/products/${id}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await request.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
