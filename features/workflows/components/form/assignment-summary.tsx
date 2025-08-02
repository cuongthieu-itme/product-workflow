"use client";

import { useFormContext } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2 } from "lucide-react";
import { useDepartmentsQuery } from "@/features/departments/hooks";

export function AssignmentSummary() {
  const { watch } = useFormContext<CreateWorkflowInputType>();
  const subprocesses = watch("subprocesses");
  const sameAssign = watch("sameAssigns") || [];

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  const stepsByDepartment2 = useMemo(() => {
    if (!sameAssign || sameAssign.length === 0) return {};

    const grouped: Record<
      number,
      Array<{ step: (typeof subprocesses)[0]; index: number }>
    > = {};

    sameAssign.forEach((assign) => {
      const deptId = assign.departmentId;
      assign.steps.forEach((stepId) => {
        const index = subprocesses?.findIndex((sp) => sp.step === stepId);
        if (index !== undefined && index !== -1 && subprocesses) {
          const step = subprocesses[index];
          if (!grouped[deptId]) grouped[deptId] = [];
          grouped[deptId].push({ step, index });
        }
      });
    });

    return grouped;
  }, [sameAssign, subprocesses]);

  // Nhóm các bước theo phòng ban
  const stepsByDepartment = useMemo(() => {
    const grouped: Record<
      number,
      Array<{ step: (typeof subprocesses)[0]; index: number }>
    > = {};

    subprocesses?.forEach((step, index) => {
      if (step.departmentId) {
        if (!grouped[step.departmentId]) {
          grouped[step.departmentId] = [];
        }
        grouped[step.departmentId].push({ step, index });
      }
    });

    return grouped;
  }, [subprocesses]);

  const getDepartmentName = (deptId: number) => {
    return (
      departments?.data?.find((dept) => dept.id === deptId)?.name ||
      "Không xác định"
    );
  };

  // Chỉ hiển thị những phòng ban có nhiều hơn 1 bước
  const multipleDepartmentSteps = Object.entries(stepsByDepartment).filter(
    ([_, steps]) => steps.length > 1
  );

  if (multipleDepartmentSteps.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-blue-800">
          <Building2 className="h-4 w-4" />
          Các phòng ban được assign người cùng một bước
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {multipleDepartmentSteps.map(([deptId, steps]) => (
          <div key={deptId} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                {getDepartmentName(Number(deptId))}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({steps.length} bước)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
              {steps.map(({ step, index }) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-white rounded border"
                >
                  <div className="font-medium">
                    Bước {step.step}: {step.name}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    {step.roleOfThePersonInCharge || "Chưa có người đảm nhiệm"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          💡 Các bước trong cùng phòng ban có thể được quản lý cùng nhau
        </div>
      </CardContent>
    </Card>
  );
}
