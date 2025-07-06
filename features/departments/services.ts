import request from "@/configs/axios-config";
import { omitVoid } from "@/utils/removeParams";
import { DepartmentFilterInput, CreateDepartmentInputType } from "./type";

export const getDepartments = async (params?: DepartmentFilterInput) => {
  try {
    const res = await request.get("/departments", { params: omitVoid(params) });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createDepartment = async (data: CreateDepartmentInputType) => {
  try {
    const res = await request.post("/departments", data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateDepartment = async (
  id: string,
  data: CreateDepartmentInputType
) => {
  try {
    const res = await request.put(`/departments/${id}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    const res = await request.delete(`/departments/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
