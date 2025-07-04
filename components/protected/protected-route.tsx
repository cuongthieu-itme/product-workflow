"use client";

import React, { useEffect } from "react";
import { useGetUserInfoQuery } from "../../pages/auth/hooks";
import { getAccessTokenFromStorage } from "@/utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessTokenFromStorage();
  const { data, isLoading, isError, error } = useGetUserInfoQuery();
  const navigate = useRouter();
  useEffect(() => {
    if (!token) navigate.push("/login");
  }, [navigate, token]);
  if (isError && error) return <></>;
  if (isLoading || !data)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-18 w-18 animate-spin" />
      </div>
    );

  return children;
}
