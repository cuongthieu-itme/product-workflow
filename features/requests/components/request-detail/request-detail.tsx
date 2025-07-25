"use client";

import { useState } from "react";
import { OverViewTab } from "./overview-tab";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WorkFlowTab } from "./workflow-tab";
import { HistoryTab } from "./history-tab";
import { ReviewTab } from "./review-tab/review-tab";
import { ImageTab } from "./image-tab";
import { MaterialTab } from "./material-tab";
import { useGetRequestDetailQuery } from "../../hooks";
import {
  calculateCompletionPercentage,
  formatDate,
  generateRequestStatus,
  getRequestStatusColor,
  getStatusColor,
} from "../../helpers";

export function RequestDetail() {
  const { data: request, isLoading } = useGetRequestDetailQuery();
  const [activeTab, setActiveTab] = useState("overview");
  const percentRequest = calculateCompletionPercentage(
    request?.procedureHistory.subprocessesHistory || []
  );
  const isCompleted = percentRequest === 100;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            Yêu cầu {request?.title}
            <Badge variant="outline" className="ml-2">
              {request?.id}
            </Badge>
          </h1>

          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Tạo lúc: {formatDate(request?.createdAt, "dd/MM/yyyy HH:mm")}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>
              Cập nhật: {formatDate(request?.updatedAt, "dd/MM/yyyy HH:mm")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn("px-3 py-1", getRequestStatusColor(request?.status))}
          >
            {generateRequestStatus(request?.status)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={!isCompleted}
          >
            Chuyển thành sản phẩm
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex justify-start gap-2 whitespace-nowrap w-[fit-content]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="workflow">Quy trình</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="materials">Vật liệu</TabsTrigger>
        </TabsList>

        <OverViewTab />
        <WorkFlowTab />
        <ReviewTab />
        <ImageTab />
        <MaterialTab />
      </Tabs>
    </div>
  );
}
