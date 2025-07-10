import { materialsMock } from "./mock";
import { CreateMaterialInputType } from "./schema/create-material-schema";
import { MaterialFilterInput } from "./type";

export const getMaterials = async (params?: MaterialFilterInput) => {
  return materialsMock;
};

export const createMaterial = async (data: CreateMaterialInputType) => {
  return data;
};
