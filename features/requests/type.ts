import { PaginatedResult } from "@/types/common";

export type RequestType = {
  id: string;
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
