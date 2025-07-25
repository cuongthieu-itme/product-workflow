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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
      <div className="relative space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative group">
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-blue-400 to-blue-200" />
            )}

            <div className="flex items-start gap-6">
              {/* Step indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br  shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-black font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50">
                  <CardContent className="p-6">
                    {/* Header section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-xl text-gray-800 truncate">
                            {step?.name}
                          </h3>
                          {step.isStepWithCost && (
                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 shadow-sm">
                              Có chi phí
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            Thời gian dự kiến
                          </span>
                        </div>
                        <p className="text-blue-800 font-semibold">
                          {step.estimatedNumberOfDays} ngày
                        </p>
                      </div>
                    </div>

                    {/* Responsibility section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                          👤 Người phụ trách
                        </span>
                        <span className="text-gray-800 font-medium">
                          {step.roleOfThePersonInCharge}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                          🏢 Phòng ban
                        </span>
                        <span className="text-gray-800 font-medium">
                          {step.department?.name}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  Phiên bản {workflowProcess.version}
                </Badge>
                <CardTitle className="text-2xl font-bold">
                  {workflowProcess?.name}
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 mt-1">
                {workflowProcess.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
            <p className="text-sm text-gray-700 font-medium">
              {format(new Date(workflowProcess.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-500">Ngày cập nhật</p>
            <p className="text-sm text-gray-700 font-medium">
              {format(new Date(workflowProcess.updatedAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-500">Số bước</p>
            <p className="text-sm text-gray-700 font-medium">
              {workflowProcess.subprocesses?.length || 0} bước
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tree */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-xl text-gray-800">
                  Bước thực hiện
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {workflowSteps.length} bước trong quy trình
                </p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm bước
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {renderWorkflowSteps(workflowSteps)}
        </CardContent>
      </Card>
    </div>
  );
};
