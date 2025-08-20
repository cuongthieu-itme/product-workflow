import { MaterialEnum } from "./constants";

export type MaterialType = {
  id: number;
  image: string[];
  code: string;
  name: string;
  quantity: number;
  unit: string;
  origin: {
    id: number;
    name: string;
  };
  isActive: boolean;
  requestInput: {
    id: number;
    quantity: number;
    expectedDate: string;
    supplier: string;
    sourceCountry: string;
    price: number;
    reason: string;
    materialId: number;
    createdAt: string;
    updatedAt: string;
  };
  description: string;
  type: MaterialEnum;
  createdAt: string;
  updatedAt: string;
  price: number;
};

export type MaterialFilterInput = {
  page: number;
  limit: number;
  name?: string;
  origin?: string;
  isActive?: boolean;
  unit?: string;
  type?: MaterialEnum;
};

export type ChangeStatusMaterialInput = {
  id: string | number;
  isActive: boolean;
};

export type SelectOptionMaterialType = {
  id: string;
  name: string;
};

export type AccessoryType = {
  id: string;
  image: string[];
  code: string;
  name: string;
  isActive: boolean;
  price: number;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ChangeStatusAccessoryInput = {
  id: string;
  isActive: boolean;
};

export type AccessoryFilterInput = {
  page: number;
  limit: number;
  name?: string;
  isActive?: boolean;
};

export type OriginType = {
  id: number;
  name: string;
};
