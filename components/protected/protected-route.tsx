"use client";

import React, { useEffect } from "react";
import { getAccessTokenFromStorage } from "@/utils";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useGetUserInfoQuery } from "@/features/auth/hooks";

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
        <Loader className="h-24 w-24 animate-spin" />
      </div>
    );

  return children;
}
