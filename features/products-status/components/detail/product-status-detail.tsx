"use client";

import { useState } from "react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Workflow } from "lucide-react";
import { BaseDialog } from "@/components/dialog";
import { useProductStatusQuery } from "../../hooks";
import { StatusInfoCard } from "./status-info-card";
import { WorkFlow } from "./work-flow";

interface ProductStatusDetailProps {
  statusId: number;
  open: boolean;
  onOpenChange: (statusId: number | null) => void;
}

export function ProductStatusDetail({
  statusId,
  open,
  onOpenChange,
}: ProductStatusDetailProps) {
  const [activeTab, setActiveTab] = useState("info");
  const { data: productStatus } = useProductStatusQuery(String(statusId));

  if (!open) return null;

  return (
    <BaseDialog
      open={open}
      onClose={() => onOpenChange(null)}
      contentClassName="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {productStatus?.data?.name || "Chi tiết trạng thái"}
          {productStatus?.data?.color && (
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: productStatus.data.color }}
              aria-hidden="true"
            ></div>
          )}
        </DialogTitle>
        <DialogDescription>
          {productStatus?.data?.description ||
            "Thông tin chi tiết về trạng thái sản phẩm và quy trình liên quan"}
        </DialogDescription>
      </DialogHeader>

      <Tabs
        defaultValue="info"
        className="flex-1 overflow-hidden flex flex-col"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="info" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <Workflow className="h-4 w-4" />
            Quy trình
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-4">
          <TabsContent value="info" className="h-full overflow-auto">
            <StatusInfoCard status={productStatus?.data} />
          </TabsContent>

          <TabsContent value="workflow" className="h-full overflow-auto">
            {productStatus?.data?.procedure?.id && (
              <WorkFlow procedureId={productStatus?.data?.procedure?.id} />
            )}
          </TabsContent>
        </div>
      </Tabs>

      <DialogFooter className="pt-2">
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(null);
          }}
        >
          Đóng
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
