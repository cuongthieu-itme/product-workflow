"use client";

import type React from "react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Users, Package2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateRequestMutation } from "../hooks";
import { BaseDialog } from "@/components/dialog";
import { MaterialForm } from "@/features/materials";
import { openMaterialDialogAtom, sourceAtom } from "../requestAtom";
import { useAtom } from "jotai";
import { CustomerFormDialog } from "./customer";
import { UserInfoCard } from "./user-info-card";
import { RequestFormTab } from "./request-form-tab";
import { SourceEnum } from "../constants";

interface RequestFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export function RequestForm({
  isDialogOpen,
  setIsDialogOpen,
}: RequestFormProps) {
  const [open, setOpen] = useAtom(openMaterialDialogAtom);
  const [activeTab, setActiveTab] = useAtom(sourceAtom);
  const { isSuccess, error } = useCreateRequestMutation();

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo yêu cầu mới"
        description="Điền thông tin để tạo yêu cầu mới. Nhấn nút Tạo yêu cầu khi hoàn tất."
        contentClassName="w-[900px] max-w-[95vw]"
      >
        <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
          <div className="space-y-6 pr-4">
            {isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Tạo yêu cầu thành công!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Yêu cầu đã được tạo thành công và đã được thêm vào hệ thống.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <UserInfoCard />

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as SourceEnum)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value={SourceEnum.CUSTOMER}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Khách hàng
                </TabsTrigger>
                <TabsTrigger
                  value={SourceEnum.OTHER}
                  className="flex items-center gap-2"
                >
                  <Package2 className="h-4 w-4" />
                  Khác
                </TabsTrigger>
              </TabsList>

              <TabsContent value={SourceEnum.CUSTOMER} className="mt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Yêu cầu từ nguồn khách hàng
                    </h3>
                    <p className="text-xs text-blue-600">
                      Tạo yêu cầu từ nguồn khách hàng
                    </p>
                  </div>
                  <RequestFormTab onSuccess={handleSuccess} />
                </div>
              </TabsContent>

              <TabsContent value={SourceEnum.OTHER} className="mt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-900 mb-1">
                      Yêu cầu từ nguồn khác
                    </h3>
                    <p className="text-xs text-purple-600">
                      Tạo yêu cầu từ nguồn khác
                    </p>
                  </div>
                  <RequestFormTab onSuccess={handleSuccess} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </BaseDialog>

      <MaterialForm isDialogOpen={open} onClose={() => setOpen(false)} />
      <CustomerFormDialog />
    </>
  );
}
