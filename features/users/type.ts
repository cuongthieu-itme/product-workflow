import { PaginatedResult } from "@/types/common";
import { UserRoleEnum } from "../auth/constants";

export type User = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isVerifiedAccount: string;
  verifiedDate: string;
  role: UserRoleEnum;
  lastLoginDate: string;
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
};

export type UsersType = PaginatedResult<"data", User>;
