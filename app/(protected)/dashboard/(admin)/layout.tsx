import { RoleProtectedRoute } from "@/components/protected";
import { UserRoleEnum } from "@/features/auth/constants";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedRoute
      allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}
    >
      {children}
    </RoleProtectedRoute>
  );
}
