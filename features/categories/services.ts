import request from "@/configs/axios-config";
import { omitVoid } from "@/utils/removeParams";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { CreateCategoryInputType, UpdateCategoryInputType } from "./schema";
import { CategoryFilterInput } from "./types";
import { CategoryType } from "./types";

export const getCategories = async (params?: CategoryFilterInput) => {
  try {
    const response = await request.get<PaginatedResult<"data", CategoryType>>(
      "/categories",
      {
        params: omitVoid(params),
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (data: CreateCategoryInputType) => {
  try {
    const response = await request.post<CategoryType>("/categories", {
      ...data,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (data: UpdateCategoryInputType) => {
  try {
    const response = await request.put<CategoryType>(`/categories/${data.id}`, {
      ...omitVoid(data),
      id: undefined,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (id: string) => {
  try {
    const response = await request.get<CategoryType>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    await request.delete(`/categories/${id}`);
  } catch (error) {
    throw error;
  }
};
