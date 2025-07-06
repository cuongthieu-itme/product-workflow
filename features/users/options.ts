import { SelectOption } from "@/components/form/select";
import { UserRoleEnum } from "@/features/auth/constants";

export const userRoles: SelectOption[] = [
  { value: UserRoleEnum.USER, label: "Người dùng" },
  { value: UserRoleEnum.ADMIN, label: "Admin" },
];
