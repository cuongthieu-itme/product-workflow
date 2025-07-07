import request from "@/configs/axios-config";
import { DepartmentFilterInput, DepartmentsType, DepartmentType } from "./type";
import { omitVoid } from "@/utils/removeParams";
import { CreateDepartmentInputType, UpdateDepartmentInputType } from "./schema";
import { he } from "date-fns/locale";

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
