"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LinkIcon } from "lucide-react";
import { ProductStatusType } from "../../types";

interface StatusInfoCardProps {
  status?: ProductStatusType;
}

export function StatusInfoCard({ status }: StatusInfoCardProps) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-4 p-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {status ? (
              <>
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Tên:</div>
                  <div>{status.name}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Mô tả:</div>
                  <div>{status.description || "Không có mô tả"}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Màu sắc:</div>
                  <div className="flex items-center gap-2">
                    {status.color ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span>{status.color.toUpperCase()}</span>
                      </>
                    ) : (
                      "Không có màu"
                    )}
                  </div>
                </div>
                {/* <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Mặc định:</div>
                  <div>{status.isDefault ? "Có" : "Không"}</div>
                </div> */}
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Quy trình:</div>
                  <div className="flex items-center gap-2">
                    {/* TODO: API quy trình */}
                    {/* {status.workflowId === getStandardWorkflowId() ? (
                        <span>Quy trình chuẩn</span>
                      ) : subWorkflow ? (
                        <span>Quy trình tùy chỉnh: {subWorkflow.name}</span>
                      ) : (
                        <span>
                          Quy trình tùy chỉnh (ID: {status.workflowId})
                        </span>
                      )} */}
                    <span>Chưa có quy trình</span>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Không tìm thấy thông tin trạng thái
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê sử dụng</CardTitle>
            <CardDescription>
              Thông tin về việc sử dụng trạng thái này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">
                  Sản phẩm đang sử dụng
                </div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">
                  Yêu cầu đang xử lý
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
