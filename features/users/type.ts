import { PaginatedResult } from "@/types/common";
import { UserRoleEnum } from "../auth/constants";
import { DepartmentType } from "../departments/type";

export type User = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isVerifiedAccount: boolean;
  verifiedDate: string;
  role: UserRoleEnum;
  avatarUrl: string;
  lastLoginDate: string;
  department: DepartmentType | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UserFilterInput = {
  fullName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRoleEnum;
  isVerifiedAccount?: boolean;
  limit?: number;
  page?: number;
  departmentId?: string;
};

export type UsersType = PaginatedResult<"data", User>;
