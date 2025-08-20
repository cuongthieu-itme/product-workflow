"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { Building2, User, Users } from "lucide-react";

interface BatchAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchAssignModal({ isOpen, onClose }: BatchAssignModalProps) {
  const { watch, setValue, getValues } =
    useFormContext<CreateWorkflowInputType>();
  const subprocesses = watch("subprocesses");

  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );

  const { data: departments } = useDepartmentsQuery({ limit: 1000 });

  // Nhóm các bước theo department
  const stepsByDepartment = useMemo(() => {
    const grouped: Record<
      number,
      Array<{ step: (typeof subprocesses)[0]; originalIndex: number }>
    > = {};

    subprocesses?.forEach((step, index) => {
      if (step.departmentId) {
        if (!grouped[step.departmentId]) {
          grouped[step.departmentId] = [];
        }
        grouped[step.departmentId].push({ step, originalIndex: index });
      }
    });

    return grouped;
  }, [subprocesses]);

  const departmentOptions = useMemo(() => {
    return Object.keys(stepsByDepartment).map((deptId) => {
      const department = departments?.data?.find(
        (d) => d.id === Number(deptId)
      );
      return {
        value: Number(deptId),
        label: department?.name || `Department ${deptId}`,
      };
    });
  }, [stepsByDepartment, departments]);

  const availableSteps = selectedDepartment
    ? stepsByDepartment[selectedDepartment] || []
    : [];

  const handleStepToggle = (stepIndex: number, checked: boolean) => {
    setSelectedSteps((prev) =>
      checked
        ? [...prev, stepIndex]
        : prev.filter((index) => index !== stepIndex)
    );
  };

  const handleSelectAll = () => {
    if (selectedSteps.length === availableSteps.length) {
      setSelectedSteps([]);
    } else {
      setSelectedSteps(availableSteps.map((item) => item.originalIndex));
    }
  };

  const handleAssign = () => {
    if (selectedSteps.length === 0 || !selectedDepartment) return;

    // Lưu vào sameAssign array
    const currentSameAssign = getValues("sameAssigns") || [];
    const newSameAssign = {
      departmentId: selectedDepartment,
      steps: availableSteps
        .filter((item) => selectedSteps.includes(item.originalIndex))
        .map((item) => item.step.step || 0),
    };

    // Kiểm tra xem đã có assign cho department này chưa
    const existingIndex = currentSameAssign.findIndex(
      (assign) => assign.departmentId === selectedDepartment
    );

    if (existingIndex >= 0) {
      // Cập nhật existing
      setValue(`sameAssigns.${existingIndex}`, newSameAssign, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Thêm mới
      setValue("sameAssigns", [...currentSameAssign, newSameAssign], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    // Reset form và đóng modal
    setSelectedSteps([]);
    setSelectedDepartment(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedSteps([]);
    setSelectedDepartment(null);
    onClose();
  };

  const getDepartmentName = (deptId: number) => {
    return (
      departments?.data?.find((dept) => dept.id === deptId)?.name ||
      "Không xác định"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cài đặt các bước chung người làm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin hướng dẫn */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">
                  Cách sử dụng tính năng này:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Chọn phòng ban để xem các bước thuộc phòng ban đó</li>
                  <li>• Chọn các bước cần assign cho cùng một người</li>
                  <li>
                    • Chỉ có thể assign cùng lúc cho các bước trong cùng phòng
                    ban
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chọn phòng ban */}
          <div className="space-y-3">
            <Label htmlFor="department-select">Chọn phòng ban</Label>
            <Select
              value={selectedDepartment?.toString() || ""}
              onValueChange={(value) => {
                setSelectedDepartment(value ? Number(value) : null);
                setSelectedSteps([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban để xem các bước" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDepartment && availableSteps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Không có bước nào trong phòng ban này</p>
            </div>
          )}

          {/* Hiển thị các bước của phòng ban được chọn */}
          {selectedDepartment && availableSteps.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Các bước của phòng ban:{" "}
                    {getDepartmentName(selectedDepartment)}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    type="button"
                  >
                    {selectedSteps.length === availableSteps.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableSteps.map((item) => (
                    <div
                      key={item.originalIndex}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedSteps.includes(item.originalIndex)}
                        onCheckedChange={(checked) =>
                          handleStepToggle(
                            item.originalIndex,
                            checked as boolean
                          )
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Bước {item.step.step}</Badge>
                          <span className="font-medium">{item.step.name}</span>
                          {item.step.isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Bắt buộc
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.step.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Hiện tại:{" "}
                            {item.step.roleOfThePersonInCharge || "Chưa assign"}
                          </span>
                          <span>{item.step.estimatedNumberOfDays} ngày</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} type="button">
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedSteps.length === 0}
            type="button"
          >
            Assign cho {selectedSteps.length} bước
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
