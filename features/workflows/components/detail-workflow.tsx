"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Clock,
  Plus,
  ChevronRight,
  ChevronLeft,
  User,
  ListChecks,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useGetWorkflowProcessByIdQuery } from "../hooks";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { WorkFlowStepType } from "../types";

export const DetailWorkflow = () => {
  const params = useParams();
  const { toast } = useToast();

  const { data: workflowProcess } = useGetWorkflowProcessByIdQuery(
    Number(params.id)
  );
  const workflowSteps = workflowProcess?.subprocesses || [];

  if (!workflowProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy quy trình</p>
      </div>
    );
  }

  const renderWorkflowSteps = (steps: WorkFlowStepType[]) => {
    return (
      <div className="relative space-y-4">
        {/* Timeline */}
        <div className="absolute left-[22px] top-8 bottom-8 w-[2px] bg-primary/20" />

        {steps.map((step, index) => (
          <div key={step.id} className="relative mb-6 pl-12">
            {/* Step indicator */}
            <div
              className={cn(
                "absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm",
                index === 0
                  ? "border-primary bg-primary text-white"
                  : "border-primary/30 bg-background text-primary"
              )}
            >
              <span className="text-sm font-medium">{index + 1}</span>
            </div>

            {/* Step content */}
            <div
              className={cn(
                "rounded-lg border p-4 transition-all",
                index === 0
                  ? "border-primary/20 bg-primary/5 shadow-sm"
                  : "border-border bg-card/50 hover:bg-card/80"
              )}
            >
              <div className="flex items-start justify-between">
                <h4
                  className={cn(
                    "text-sm font-medium",
                    index === 0 ? "text-primary" : ""
                  )}
                >
                  {step.name}
                </h4>

                <div className="flex gap-2">
                  {step.isRequired && (
                    <Badge className="bg-blue-500/80 text-[10px] px-1.5 py-0">
                      Bắt buộc
                    </Badge>
                  )}
                  {step.isStepWithCost && (
                    <Badge className="bg-amber-500 text-[10px] px-1.5 py-0">
                      Có chi phí
                    </Badge>
                  )}
                </div>
              </div>

              {step.description && (
                <p className="mt-2 text-xs text-muted-foreground border-l-2 border-muted pl-2">
                  {step.description}
                </p>
              )}

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Thời gian ước tính:
                    </span>{" "}
                    <span className="font-medium">
                      {step.estimatedNumberOfDays} ngày
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50">
                    <User className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Người phụ trách:
                    </span>{" "}
                    <span className="font-medium">
                      {step.roleOfThePersonInCharge || "Chưa xác định"}
                    </span>
                  </div>
                </div>
              </div>

              {step.department && (
                <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">
                    Phòng ban phụ trách:
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-background font-normal h-5"
                  >
                    {step.department.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Phiên bản {workflowProcess.version}
                </Badge>
                <CardTitle>{workflowProcess?.name}</CardTitle>
              </div>
              {workflowProcess.description && (
                <CardDescription>{workflowProcess.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-t pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="text-sm font-medium">
                  {format(
                    new Date(workflowProcess.createdAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
                <Edit className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Cập nhật gần nhất
                </p>
                <p className="text-sm font-medium">
                  {format(
                    new Date(workflowProcess.updatedAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                <ListChecks className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng số bước</p>
                <p className="text-sm font-medium">
                  {workflowProcess.subprocesses?.length || 0} bước
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tree */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base">Các bước thực hiện</CardTitle>
              <CardDescription>
                {workflowSteps.length} bước trong quy trình
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm bước
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderWorkflowSteps(workflowSteps)}
        </CardContent>
      </Card>
    </div>
  );
};
