import request from "@/configs/axios-config";
import {
  CreateMaterialInputType,
  UpdateMaterialInputType,
} from "./schema/create-material-schema";
import {
  AccessoryFilterInput,
  AccessoryType,
  ChangeStatusAccessoryInput,
  ChangeStatusMaterialInput,
  MaterialFilterInput,
  MaterialType,
  OriginType,
} from "./type";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { omitVoid } from "@/utils/removeParams";
import { AccessoryInputType } from "./schema";
import { UpdateAccessoryInputType } from "./schema/accessory-schema";

export const getMaterials = async (params?: MaterialFilterInput) => {
  try {
    const response = await request.get<PaginatedResult<"data", MaterialType>>(
      "/materials",
      {
        params: omitVoid(params),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get materials error:", error);
    throw error;
  }
};

export const createMaterial = async (data: CreateMaterialInputType) => {
  try {
    const response = await request.post<MaterialType>("/materials", data);
    return response.data;
  } catch (error) {
    console.error("Create material error:", error);
    throw error;
  }
};

export const updateMaterial = async ({
  id,
  ...data
}: UpdateMaterialInputType) => {
  try {
    const response = await request.patch<MaterialType>(
      `/materials/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update material error:", error);
    throw error;
  }
};

export const changeStatusMaterial = async ({
  id,
  isActive,
}: ChangeStatusMaterialInput) => {
  try {
    const response = await request.patch(`/materials/${id}`, {
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
    const response = await request.get<BaseResultQuery<OriginType[]>>(
      "/origins"
    );
    return response.data;
  } catch (error) {
    console.error("Get origins error:", error);
    throw error;
  }
};

export const getUnits = async () => {
  try {
    const response = await request.get<BaseResultQuery<OriginType[]>>("/units");
    return response.data;
  } catch (error) {
    console.error("Get units error:", error);
    throw error;
  }
};

export const createAccessory = async (data: AccessoryInputType) => {
  try {
    const response = await request.post<AccessoryType>("/accessories", data);
    return response.data;
  } catch (error) {
    console.error("Create accessory error:", error);
    throw error;
  }
};

export const updateAccessory = async ({
  id,
  ...data
}: UpdateAccessoryInputType) => {
  try {
    const response = await request.patch<AccessoryType>(
      `/accessories/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update accessory error:", error);
    throw error;
  }
};

export const changeStatusAccessory = async ({
  id,
  isActive,
}: ChangeStatusAccessoryInput) => {
  try {
    const response = await request.patch(`/accessories/${id}`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error("Change status accessory error:", error);
    throw error;
  }
};

export const getAccessories = async (params?: AccessoryFilterInput) => {
  try {
    const response = await request.get<PaginatedResult<"data", AccessoryType>>(
      "/accessories",
      {
        params: omitVoid(params),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get accessories error:", error);
    throw error;
  }
};

export const getAccessoryDetail = async (id: string) => {
  try {
    const response = await request.get<AccessoryType>(`/accessories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get accessory by id error:", error);
    throw error;
  }
};

export const deleteAccessory = async (id: string) => {
  try {
    const response = await request.delete(`/accessories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete accessory error:", error);
    throw error;
  }
};
