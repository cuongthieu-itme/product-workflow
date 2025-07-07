"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDepartmentsQuery } from "../hooks";

export function DepartmentList() {
  const router = useRouter();
  const { data: departments, isLoading, error } = useDepartmentsQuery();

  const navigateToDepartment = (departmentId: number) => {
    router.push(`/dashboard/departments/${departmentId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {departments?.data.map((department) => (
          <Button
            key={department.id}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigateToDepartment(department.id)}
          >
            {department.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
