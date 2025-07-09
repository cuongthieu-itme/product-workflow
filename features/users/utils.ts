import { UserRoleEnum } from "../auth/constants";

export const getUserRole = (role: UserRoleEnum) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return "Quản trị viên";
    case UserRoleEnum.USER:
      return "Người dùng";
    case UserRoleEnum.SUPER_ADMIN:
      return "Quản trị viên cao cấp";
    default:
      return "Khác";
  }
};
