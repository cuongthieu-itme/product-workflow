import { UserRoleEnum } from "../auth/constants";

export const getUserRole = (role: UserRoleEnum) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return "Admin";
    case UserRoleEnum.USER:
      return "User";
    case UserRoleEnum.SUPER_ADMIN:
      return "Super Admin";
    default:
      return "Khác";
  }
};
