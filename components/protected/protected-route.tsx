"use client";

import React, { useEffect } from "react";
import { useGetUserInfoQuery } from "../../pages/auth/hooks";
import { getAccessTokenFromStorage } from "@/utils";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessTokenFromStorage();
  const { data, isLoading, isError, error } = useGetUserInfoQuery();
  const navigate = useRouter();
  useEffect(() => {
    if (!token) navigate.push("/login");
  }, [navigate, token]);
  if (isError && error) return <></>;
  if (isLoading || !data) return null;

  return children;
}
