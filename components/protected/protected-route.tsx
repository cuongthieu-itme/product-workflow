"use client";

import React, { useEffect } from "react";
import { getAccessTokenFromStorage } from "@/utils";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";
import { useGetUserInfoQuery } from "@/features/auth/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessTokenFromStorage();
  const { data, isLoading, isError, error } = useGetUserInfoQuery();
  const navigate = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) navigate.push("/login");
  }, [navigate, token]);

  useEffect(() => {
    if (data && data.isFirstLogin && pathname !== "/change-password") {
      navigate.push("/change-password");
    }
  }, [data, navigate, pathname]);

  if (isError && error) return <></>;
  if (isLoading || !data)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );

  return children;
}
