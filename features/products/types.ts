import { PaginatedResult } from "@/types/common";

export interface Category {
  id: number;
  name: string;
}

export type ProductType = {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
};

export interface ProductFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
}

export type ProductsType = PaginatedResult<"data", ProductType>;
