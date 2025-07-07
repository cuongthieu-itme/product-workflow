import request from "@/configs/axios-config";
import {
  DepartmentDetailType,
  DepartmentFilterInput,
  DepartmentsType,
  DepartmentType,
} from "./type";
import { omitVoid } from "@/utils/removeParams";
import { CreateDepartmentInputType, UpdateDepartmentInputType } from "./schema";
import { BaseResultQuery } from "@/types/common";

export const getDepartments = async (params?: DepartmentFilterInput) => {
  try {
    const response = await request.get<DepartmentsType>("/departments", {
      params: omitVoid(params),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDepartment = async (data: CreateDepartmentInputType) => {
  try {
    const response = await request.post<DepartmentType>("/departments", {
      ...data,
      headId: Number(data.headId),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDepartment = async (data: UpdateDepartmentInputType) => {
  const { id, ...requestBody } = data;
  try {
    const response = await request.put(
      `/departments/${id}`,
      omitVoid(requestBody)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepartment = async (id: string) => {
  try {
    const response = await request.get<BaseResultQuery<DepartmentDetailType>>(
      `/departments/${id}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
