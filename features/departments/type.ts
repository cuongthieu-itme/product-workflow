import { PaginatedResult } from "@/types/common";
import { User } from "../users/type";

export type DepartmentType = {
  id: number;
  name: string;
  description: string;
  headId: number | null;
  head: any | null;
  _count: {
    members: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type DepartmentFilterInput = {
  page?: number;
  limit?: number;
  search?: string;
};

export type DepartmentDetailType = {
  id: number;
  name: string;
  description: string;
  headId: number | null;
  head: User;
  members: User[];
  _count: {
    members: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type DepartmentsType = PaginatedResult<"data", DepartmentType>;
