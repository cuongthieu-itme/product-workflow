"use client";

import React, { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { Loader } from "lucide-react";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { getAccessTokenFromStorage } from "@/utils";
import { UserRoleEnum } from "@/features/auth/constants";

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRoleEnum[];
    /**
     * If true show 404 notFound page when unauthorized, otherwise show fallback text.
     */
    showNotFound?: boolean;
}

export function RoleProtectedRoute({
    children,
    allowedRoles,
    showNotFound = true,
}: RoleProtectedRouteProps) {
    const token = getAccessTokenFromStorage();
    const router = useRouter();
    const { data: user, isLoading } = useGetUserInfoQuery();
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        // If no token at all -> go to login
        if (!token) {
            router.replace("/login");
            return;
        }

        // When user data loaded, check role
        if (!isLoading && user) {
            if (!allowedRoles.includes(user.role as UserRoleEnum)) {
                if (showNotFound) {
                    notFound();
                } else {
                    // Fallback: display simple unauthorized text
                    setUnauthorized(true);
                }
            }
        }
    }, [token, router, user, isLoading, allowedRoles, showNotFound]);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="h-24 w-24 animate-spin" />
            </div>
        );
    }

    // Authorized user
    if (allowedRoles.includes(user.role as UserRoleEnum)) {
        return <>{children}</>;
    }

    // Unauthorized and showNotFound==false cases handled via state (simple message)
    if (unauthorized) {
        return (
            <div className="flex items-center justify-center h-screen">
                Bạn không có quyền truy cập nội dung này.
            </div>
        );
    }

    // While redirect will happen via useEffect, still return null as fallback
    return null;
}
