import { UserRoleEnum } from "../auth/constants";
import { DepartmentType } from "../departments/type";

export type CurrentUserType = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  isVerifiedAccount: boolean;
  verifiedDate: string;
  createdAt: string;
  role: UserRoleEnum;
  lastLoginDate: string;
  department: DepartmentType;
};

export type NotificationType = {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};
