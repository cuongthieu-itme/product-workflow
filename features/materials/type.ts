import { MaterialEnum } from "./constants";

export type MaterialType = {
  id: string;
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
  description: string;
  type: MaterialEnum;
  createdAt: string;
  updatedAt: string;
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
  id: string;
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
