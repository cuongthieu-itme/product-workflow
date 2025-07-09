import { UserRoleEnum } from "./constants";

export type UserType = {
  avatarUrl: string;
  id: number;
  fullName: string;
  userName: string;
  email: string;
  isVerifiedAccount: boolean;
  verifiedDate: string;
  role: UserRoleEnum;
  lastLoginDate: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
};
