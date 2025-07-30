"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  PlusCircle,
  Package,
  Wrench,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { UploadFile } from "@/components/common/upload";
import { Fragment, useEffect } from "react";
import { BaseDialog } from "@/components/dialog";
import { createMaterialInputSchema, CreateMaterialInputType } from "../schema";
import { useCreateMaterialMutation } from "../hooks";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { MaterialType } from "../type";
import {
  useOriginsQuery,
  useUpdateMaterialMutation,
} from "../hooks/useMaterials";
import { useToast } from "@/components/ui/use-toast";
import { MaterialEnum } from "../constants";

interface MaterialFormWithTabsProps {
  material?: MaterialType;
  defaultTab?: MaterialEnum;
  isDialogOpen: boolean;
  onClose: () => void;
  onMaterialAdded?: () => void;
}

export const MaterialFormWithTabs: React.FC<MaterialFormWithTabsProps> = ({
  material,
  isDialogOpen,
  onClose,
  onMaterialAdded,
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState<MaterialEnum>(
    defaultTab || MaterialEnum.MATERIAL
  );
  const { toast } = useToast();
  const prefixCode = activeTab === MaterialEnum.MATERIAL ? "M-" : "A-";

  const { control, handleSubmit, reset } = useForm<CreateMaterialInputType>({
    defaultValues: {
      code: material?.code || "",
      name: material?.name || "",
      quantity: material?.quantity || 0,
      image: material?.image || [],
      unit: material?.unit || "",
      originId: material?.origin.id || 0,
      description: material?.description || "",
      isActive: material?.isActive !== undefined ? material.isActive : true,
      type: material?.type ?? activeTab,
    },
    resolver: zodResolver(createMaterialInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    reset: resetMutation,
  } = useCreateMaterialMutation();

  const { mutate: updateMaterial } = useUpdateMaterialMutation();

  const { data: origins } = useOriginsQuery();

  const onSubmit: SubmitHandler<CreateMaterialInputType> = (data) => {
    if (material) {
      updateMaterial(
        {
          ...data,
          id: material.id,
          type: activeTab,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
            if (onMaterialAdded) {
              onMaterialAdded();
            }
            toast({
              title: "Thành công",
              description: `${
                activeTab === MaterialEnum.MATERIAL ? "Nguyên liệu" : "Phụ kiện"
              } đã được cập nhật thành công.`,
            });
          },
        }
      );
      return;
    }

    mutate(
      {
        ...data,
        type: activeTab,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
          if (onMaterialAdded) {
            onMaterialAdded();
          }
          toast({
            title: "Thành công",
            description: `${
              activeTab === MaterialEnum.MATERIAL ? "Nguyên liệu" : "Phụ kiện"
            } đã được thêm thành công.`,
          });
        },
      }
    );
  };

  useEffect(() => {
    if (isDialogOpen) {
      reset();
      resetMutation();
      // Khi cập nhật material, sử dụng type hiện tại của material
      // Khi tạo mới, sử dụng defaultTab hoặc MATERIAL
      if (material) {
        setActiveTab(material.type);
      } else {
        setActiveTab(defaultTab ?? MaterialEnum.MATERIAL);
      }
    }
  }, [isDialogOpen, material, defaultTab]);

  // Reset form khi activeTab thay đổi (chỉ khi không phải đang cập nhật)
  useEffect(() => {
    if (!material && isDialogOpen) {
      reset({
        code: "",
        name: "",
        quantity: 0,
        image: [],
        unit: "",
        originId: 0,
        description: "",
        isActive: true,
        type: activeTab,
      });
    }
  }, [activeTab, material, isDialogOpen, reset]);

  const getTabTitle = () => {
    if (material) {
      return activeTab === MaterialEnum.MATERIAL
        ? "Cập nhật nguyên liệu"
        : "Cập nhật phụ kiện";
    }
    return activeTab === MaterialEnum.MATERIAL
      ? "Tạo nguyên liệu"
      : "Tạo phụ kiện";
  };

  const getTabDescription = () => {
    if (material) {
      return activeTab === MaterialEnum.MATERIAL
        ? "Điền thông tin để cập nhật nguyên liệu. Nhấn nút Cập nhật nguyên liệu khi hoàn tất."
        : "Điền thông tin để cập nhật phụ kiện. Nhấn nút Cập nhật phụ kiện khi hoàn tất.";
    }
    return activeTab === MaterialEnum.MATERIAL
      ? "Điền thông tin để tạo nguyên liệu mới. Nhấn nút Tạo nguyên liệu khi hoàn tất."
      : "Điền thông tin để tạo phụ kiện mới. Nhấn nút Tạo phụ kiện khi hoàn tất.";
  };

  const originOptions =
    origins?.data.map((origin) => ({
      value: origin.id,
      label: origin.name,
    })) ?? [];

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-4">
        <UploadFile name="image" control={control} />

        <InputCustom
          control={control}
          name="name"
          label={
            activeTab === MaterialEnum.MATERIAL
              ? "Tên nguyên liệu"
              : "Tên phụ kiện"
          }
          placeholder={
            activeTab === MaterialEnum.MATERIAL
              ? "Nhập tên nguyên liệu"
              : "Nhập tên phụ kiện"
          }
          required
          disabled={isPending}
        />

        <TextAreaCustom
          control={control}
          name="description"
          label={
            activeTab === MaterialEnum.MATERIAL
              ? "Chi tiết nguyên liệu"
              : "Chi tiết phụ kiện"
          }
          placeholder={
            activeTab === MaterialEnum.MATERIAL
              ? "Nhập chi tiết nguyên liệu"
              : "Nhập chi tiết phụ kiện"
          }
          disabled={isPending}
        />

        <InputCustom
          prefix={prefixCode}
          control={control}
          name="code"
          label={
            activeTab === MaterialEnum.MATERIAL
              ? "Mã nguyên liệu"
              : "Mã phụ kiện"
          }
          required
          disabled={isPending}
        />

        <div className="flex gap-2 flex-row w-full justify-between">
          <InputCustom
            control={control}
            name="unit"
            label="Đơn vị"
            placeholder="Nhập đơn vị"
            required
            disabled={isPending}
            containerClassName="w-full"
            className="w-full"
          />

          <InputCustom
            control={control}
            name="quantity"
            label="Số lượng"
            placeholder="Nhập số lượng"
            required
            disabled={isPending}
            type="number"
            containerClassName="w-full"
            className="w-full"
          />
        </div>

        <SelectCustom
          options={originOptions}
          control={control}
          name="originId"
          label="Xuất xứ"
          placeholder="Nhập xuất xứ"
          required
          disabled={isPending}
          valueType="number"
        />
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Hủy
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : material ? (
            `Cập nhật ${
              activeTab === MaterialEnum.MATERIAL ? "nguyên liệu" : "phụ kiện"
            }`
          ) : (
            `Tạo ${
              activeTab === MaterialEnum.MATERIAL ? "nguyên liệu" : "phụ kiện"
            }`
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={onClose}
      title={getTabTitle()}
      description={getTabDescription()}
      contentClassName="w-[900px] max-w-[95vw]"
    >
      <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              console.log(value);
              setActiveTab(value as MaterialEnum);
            }}
            className="w-full"
          >
            {!material && (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value={MaterialEnum.MATERIAL}
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Nguyên liệu
                </TabsTrigger>
                <TabsTrigger
                  value={MaterialEnum.ACCESSORY}
                  className="flex items-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  Phụ kiện
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value={MaterialEnum.MATERIAL} className="mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    {material ? "Cập nhật nguyên liệu" : "Tạo nguyên liệu mới"}
                  </h3>
                  <p className="text-xs text-blue-600">
                    Quản lý nguyên vật liệu chính trong sản xuất
                  </p>
                </div>
                {renderForm()}
              </div>
            </TabsContent>

            <TabsContent value={MaterialEnum.ACCESSORY} className="mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-900 mb-1">
                    {material ? "Cập nhật phụ kiện" : "Tạo phụ kiện mới"}
                  </h3>
                  <p className="text-xs text-green-600">
                    Quản lý phụ kiện và vật dụng hỗ trợ
                  </p>
                </div>
                {renderForm()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};

// Component wrapper cho việc tạo mới với button
export function CreateMaterialFormWithTabs({
  onMaterialAdded,
  material,
  children,
}: {
  onMaterialAdded?: () => void;
  material?: MaterialType;
  children?: React.ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Fragment>
      {children ? (
        children
      ) : (
        <Button
          className="w-full md:w-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo nguyên liệu/phụ kiện
        </Button>
      )}

      <MaterialFormWithTabs
        material={material}
        isDialogOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onMaterialAdded={onMaterialAdded}
      />
    </Fragment>
  );
}
