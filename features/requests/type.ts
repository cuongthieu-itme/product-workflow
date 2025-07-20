import { PaginatedResult } from "@/types/common";
import { MaterialType } from "../materials/type";
import { SourceEnum } from "./constants";

export type RequestType = {
  id: number;
  title: string;
  description: string;
  productLink: string[];
  image: string[];
  source: string;
  nameSource: string;
  specificSource: string;
  userId: number;
  statusProductId: number;
  createdAt: string;
  updatedAt: string;
};

export interface RequestFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  title?: string;
}

export type RequestsType = PaginatedResult<"data", RequestType>;

export type SourceOtherType = {
  id: number;
  name: string;
  specifically: string;
  createdAt: string;
  updatedAt: string;
};

export type SourceOthersType = PaginatedResult<"data", SourceOtherType>;

export interface SourceOtherFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  specifically?: string;
}

export interface Origin {
  id: number;
  name: string;
}

export interface RequestMaterial {
  id: number;
  quantity: number;
  material: MaterialType;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
}

export interface RequestDetail {
  id: number;
  title: string;
  description: string;
  productLink: string[];
  media: string[];
  source: SourceEnum.CUSTOMER | SourceEnum.OTHER;
  customerId: number | null;
  sourceOtherId: number | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer | null;
  sourceOther: unknown | null; // chưa có schema chi tiết
  requestMaterials: RequestMaterial[];
}
