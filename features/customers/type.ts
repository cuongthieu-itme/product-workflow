import { PaginatedResult } from "@/types/common";
import { User } from "../users/type";
import { GenderEnum } from "@/constants/gender";

export enum SourceEnum {
  WEBSITE = "WEBSITE",
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
  GOOGLE_ADS = "GOOGLE_ADS",
  INTRODUCER = "INTRODUCER",
  OTHER = "OTHER",
}

export type CustomerType = {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: GenderEnum;
  dateOfBirth: string;
  source: SourceEnum;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFilterInput = {
  page?: number;
  limit?: number;
  fullName?: string;
  source?: SourceEnum;
  userId?: number;
};

export type CustomerDetailType = {
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

export type CustomersType = PaginatedResult<"data", CustomerType>;
