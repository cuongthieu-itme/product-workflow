import { materialsMock } from "./mock";
import {
  CreateMaterialInputType,
  UpdateMaterialInputType,
} from "./schema/create-material-schema";
import { MaterialFilterInput } from "./type";

export const getMaterials = async (params?: MaterialFilterInput) => {
  return materialsMock;
};

export const createMaterial = async (data: CreateMaterialInputType) => {
  return data;
};

export const updateMaterial = async (data: UpdateMaterialInputType) => {
  return data;
};

export const deleteMaterial = async (id: string) => {
  return id;
};

export const changeStatusMaterial = async (id: string) => {
  return id;
};
