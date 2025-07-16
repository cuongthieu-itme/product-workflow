import { PaginatedResult } from "@/types/common";

export interface Category {
  id: number;
  name: string;
}

export type ProductStatusType = {
  id: number;
  name: string;
  description: string;
  color: string;
  procedure: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export interface ProductStatusFilterInput {
  name?: string;
  description?: string;
  color?: string;
  procedure?: string;
  page?: number;
  limit?: number;
}

export type ProductsType = PaginatedResult<"data", ProductStatusType>;
