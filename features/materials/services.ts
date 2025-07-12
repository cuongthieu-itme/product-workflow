import request from "@/configs/axios-config";
import {
  CreateMaterialInputType,
  UpdateMaterialInputType,
} from "./schema/create-material-schema";
import { ChangeStatusMaterialInput, MaterialFilterInput, MaterialType } from "./type";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { omitVoid } from "@/utils/removeParams";
import { SelectOption } from "@/components/form/select";

export const getMaterials = async (params?: MaterialFilterInput) => {
  try {
    const response = await request.get<PaginatedResult<"data", MaterialType>>("/ingredients", {
      params: omitVoid(params),
    });
    return response.data;
  } catch (error) {
    console.error("Get materials error:", error);
    throw error;
  }
};

export const createMaterial = async (data: CreateMaterialInputType) => {
  try {
    const response = await request.post<MaterialType>("/ingredients", data);
    return response.data;
  } catch (error) {
    console.error("Create material error:", error);
    throw error;
  }
};

export const updateMaterial = async ({ id, ...data }: UpdateMaterialInputType) => {
  try {
    const response = await request.patch<MaterialType>(
      `/ingredients/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update material error:", error);
    throw error;
  }
};



export const changeStatusMaterial = async ({ id, isActive }: ChangeStatusMaterialInput) => {
  try {
    const response = await request.patch(`/ingredients/${id}`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error("Change status material error:", error);
    throw error;
  }
};


export const getOrigins = async () => {
  try {
    const response = await request.get<BaseResultQuery<SelectOption[]>>("/ingredients/origins");
    return response.data;
  } catch (error) {
    console.error("Get origins error:", error);
    throw error;
  }
};

export const getUnits = async () => {
  try {
    const response = await request.get<BaseResultQuery<SelectOption[]>>("/ingredients/units");
    return response.data;
  } catch (error) {
    console.error("Get units error:", error);
    throw error;
  }
};
