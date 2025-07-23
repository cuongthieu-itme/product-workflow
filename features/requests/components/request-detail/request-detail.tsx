"use client";

import { useState } from "react";
import { OverViewTab } from "./overview-tab";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WorkFlowTab } from "./workflow-tab";
import { HistoryTab } from "./history-tab";
import { ReviewTab } from "./review-tab/review-tab";
import { ImageTab } from "./image-tab";
import { MaterialTab } from "./material-tab";

export function RequestDetail() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const mockData = {
    title: "Yêu cầu sản xuất",
    code: "REQ-001",
    status: "pending",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "on_hold":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-2xl font-bold"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => {
                  setIsEditingTitle(false);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTempTitle(mockData.title || "");
                  setIsEditingTitle(false);
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <h1
              className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => {
                setTempTitle(mockData.title || "");
                setIsEditingTitle(true);
              }}
            >
              {mockData.title}
              <Edit className="h-4 w-4 opacity-50" />
              <Badge variant="outline" className="ml-2">
                {mockData.code}
              </Badge>
            </h1>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Tạo lúc: {format(new Date(mockData.createdAt), "dd/MM/yyyy")}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>
              Cập nhật: {format(new Date(mockData.updatedAt), "dd/MM/yyyy")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("px-3 py-1", getStatusColor(mockData.status))}>
            {mockData.status}
          </Badge>
          <Button variant="outline">Chỉnh sửa</Button>
          <Button variant="outline">Chuyển thành sản phẩm</Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-6 md:w-[800px]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="workflow">Quy trình</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="materials">Vật liệu</TabsTrigger>
        </TabsList>

        <OverViewTab />
        <WorkFlowTab />
        <HistoryTab />
        <ReviewTab />
        <ImageTab />
        <MaterialTab />
      </Tabs>
    </div>
  );
}
