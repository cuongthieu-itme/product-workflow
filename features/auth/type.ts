import { UserRoleEnum } from "./constants";

export type UserType = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  isVerifiedAccount: boolean;
  verifiedDate: string;
  role: UserRoleEnum;
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
};
