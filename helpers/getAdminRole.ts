import { UserRoleEnum } from "@/features/auth/constants";

export const checkRole = (userRole?: UserRoleEnum): boolean => {
  return (
    userRole === UserRoleEnum.ADMIN || userRole === UserRoleEnum.SUPER_ADMIN
  );
};
