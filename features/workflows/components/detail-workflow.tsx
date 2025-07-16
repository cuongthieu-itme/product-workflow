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
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="relative">
        {/* Main line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200" />

        {/* Steps container */}
        <div className="flex flex-col gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              {/* Step indicator */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 font-medium">{index + 1}</span>
              </div>

              {/* Step content */}
              <div className="pl-12">
                <Card className="p-6 group-hover:shadow-lg transition-shadow">
                  <div className="flex flex-col gap-4">
                    {/* Step header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">
                          {step?.name}
                        </h3>
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {step.estimatedNumberOfDays} ngày
                            </span>
                          </div>
                          {step.isStepWithCost && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              Có chi phí
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500">
                              Người phụ trách:
                            </span>
                            <span className="text-sm text-gray-700">
                              {step.roleOfThePersonInCharge}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500">
                              Phòng ban:
                            </span>
                            <span className="text-sm text-gray-700">
                              {step.department?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </div>

                    {/* Step details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Thời gian dự kiến
                        </p>
                        <p className="text-sm text-gray-700">
                          {step.estimatedNumberOfDays} ngày
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Trạng thái
                        </p>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Chưa bắt đầu
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
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
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 md:flex-none"
                onClick={() => {
                  toast({
                    title: "Xác nhận xóa",
                    description: "Bạn có chắc chắn muốn xóa quy trình này?",
                    action: (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // Xóa quy trình
                          toast({
                            title: "Thành công",
                            description: "Đã xóa quy trình thành công",
                          });
                        }}
                      >
                        Xóa
                      </Button>
                    ),
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
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
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Bước thực hiện</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm bước
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderWorkflowSteps(workflowSteps)}</CardContent>
      </Card>
    </div>
  );
};
