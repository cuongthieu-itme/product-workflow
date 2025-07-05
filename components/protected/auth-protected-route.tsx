"use client";

import React, { useEffect, useState } from "react";
import { getAccessTokenFromStorage } from "@/utils";
import { useRouter } from "next/navigation";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { Loader } from "lucide-react";

export function AuthProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = getAccessTokenFromStorage();
  const { isLoading, data } = useGetUserInfoQuery();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && data) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [token, router, data]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-24 w-24 animate-spin" />
      </div>
    );
  }

  return children;
}
