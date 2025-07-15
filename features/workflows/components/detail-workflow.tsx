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
import { Edit, Trash2, Clock, Plus } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{workflowProcess.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {workflowProcess.description}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
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
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
              <p className="text-sm text-gray-700">
                {format(
                  new Date(workflowProcess.createdAt),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ngày cập nhật</p>
              <p className="text-sm text-gray-700">
                {format(
                  new Date(workflowProcess.updatedAt),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Phiên bản : {workflowProcess.version}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid  grid-cols-2">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="steps">Bước thực hiện</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Mô tả chi tiết
                  </p>
                  <p className="text-sm text-gray-700">
                    {workflowProcess.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Số bước
                  </p>
                  <p className="text-sm text-gray-700">
                    {workflowProcess.subprocesses?.length || 0} bước
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bước thực hiện</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowSteps.map((step: WorkFlowStepType) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <h3 className="font-medium">{step.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-600">
                            Thời gian ước tính: {step.estimatedNumberOfDays}{" "}
                            ngày
                            {step.isStepWithCost && (
                              <Badge variant="outline" className="ml-2">
                                Có chi phí
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
