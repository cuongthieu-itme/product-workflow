import { UserRoleEnum } from "@/pages/auth/constants";

export const getRoleName = (role: UserRoleEnum): string => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return "Quản trị viên";
    case UserRoleEnum.USER:
      return "Người dùng";
    case UserRoleEnum.SUPER_ADMIN:
      return "Quản trị viên cao cấp";
    default:
      return "Người dùng";
  }
};
