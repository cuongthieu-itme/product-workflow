import { PaginatedResult } from "@/types/common";
import { UserRoleEnum } from "../auth/constants";

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

export type Member = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: UserRoleEnum;
};

export type DepartmentDetailType = {
  id: number;
  name: string;
  description: string;
  headId: number | null;
  head: Member | null;
  members: Member[];
  createdAt: string;
  updatedAt: string;
};

export type DepartmentsType = PaginatedResult<"data", DepartmentType>;
