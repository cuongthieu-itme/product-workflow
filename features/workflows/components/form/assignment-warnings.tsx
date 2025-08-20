"use client";

import { useFormContext } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useDepartmentsQuery } from "@/features/departments/hooks";

export function AssignmentWarnings() {
  const { watch } = useFormContext<CreateWorkflowInputType>();
  const subprocesses = watch("subprocesses");

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  // Tìm các bước không có phòng ban
  const stepsWithoutDepartment = useMemo(() => {
    return subprocesses?.filter((step) => !step.departmentId) || [];
  }, [subprocesses]);

  const getDepartmentName = (deptId: number) => {
    return (
      departments?.data?.find((dept) => dept.id === deptId)?.name ||
      "Không xác định"
    );
  };

  if (stepsWithoutDepartment.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <p className="font-medium">
            ⚠️ Cảnh báo: Có {stepsWithoutDepartment.length} bước chưa được chọn
            phòng ban
          </p>

          <div className="space-y-2">
            {stepsWithoutDepartment.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-800 border-orange-300"
                >
                  Bước {step.step}
                </Badge>
                <span className="text-sm">{step.name}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
            💡 Gợi ý: Hãy chọn phòng ban cho tất cả các bước để có thể quản lý
            workflow hiệu quả.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
