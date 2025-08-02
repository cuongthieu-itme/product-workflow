"use client";

import { useFormContext } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, X } from "lucide-react";
import { useDepartmentsQuery } from "@/features/departments/hooks";

export function SameAssignList() {
  const { watch, setValue } = useFormContext<CreateWorkflowInputType>();
  const sameAssign = watch("sameAssign") || [];
  const subprocesses = watch("subprocesses");

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  const getDepartmentName = (deptId: number) => {
    return (
      departments?.data?.find((dept) => dept.id === deptId)?.name ||
      "Không xác định"
    );
  };

  const getStepName = (stepNumber: number) => {
    const step = subprocesses?.find((s) => s.step === stepNumber);
    return step?.name || `Bước ${stepNumber}`;
  };

  const handleRemoveAssign = (index: number) => {
    const currentSameAssign = watch("sameAssign") || [];
    const updatedSameAssign = currentSameAssign.filter((_, i) => i !== index);
    setValue("sameAssign", updatedSameAssign, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  if (sameAssign.length === 0) {
    return null;
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-green-800">
          <User className="h-4 w-4" />
          Các nhóm assign đã lưu ({sameAssign.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sameAssign.map((assign, index) => (
          <div
            key={index}
            className="bg-white border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-300"
                  >
                    {getDepartmentName(assign.departmentId)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {assign.steps.map((stepNumber) => (
                    <Badge
                      key={stepNumber}
                      variant="secondary"
                      className="text-xs"
                    >
                      {getStepName(stepNumber)}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-green-700">
                  💡 {assign.steps.length} bước được assign cho cùng một người
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAssign(index)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
          💡 Các nhóm assign này sẽ được áp dụng khi tạo workflow. Có thể xóa
          bằng cách click vào nút X.
        </div>
      </CardContent>
    </Card>
  );
}
