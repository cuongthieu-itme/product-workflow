import { ProductType } from "../products/types";

export type CategoryType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  products: ProductType[];
  _count: {
    products: number;
  };
};

export type CategoryFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};
