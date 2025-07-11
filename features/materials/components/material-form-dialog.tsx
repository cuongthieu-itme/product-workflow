"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { ImageUpload } from "@/components/common/image-upload";
import { Fragment, useEffect, useState } from "react";
import { BaseDialog } from "@/components/dialog";
import { createMaterialInputSchema, CreateMaterialInputType } from "../schema";
import { useCreateMaterialMutation } from "../hooks";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { MaterialType } from "../type";
import { useUpdateMaterialMutation } from "../hooks/useMaterials";
import { useToast } from "@/components/ui/use-toast";

export function CreateMaterialForm({
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
          Tạo nguyên liệu
        </Button>
      )}

      <MaterialForm
        material={material}
        isDialogOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onMaterialAdded={onMaterialAdded}
      />
    </Fragment>
  );
}

interface MaterialFormProps {
  material?: MaterialType;
  isDialogOpen: boolean;
  onClose: () => void;
  onMaterialAdded?: () => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  material,
  isDialogOpen,
  onClose,
  onMaterialAdded,
}) => {
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<CreateMaterialInputType>({
    defaultValues: {
      code: material?.code || "",
      name: material?.name || "",
      count: material?.count || 0,
      image: material?.image || [],
      unit: material?.unit || "",
      origin: material?.origin || "",
      description: material?.description || "",
    },
    resolver: zodResolver(createMaterialInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    reset: resetMutation,
  } = useCreateMaterialMutation();

  const { mutate: updateMaterial, isPending: isUpdatePending } =
    useUpdateMaterialMutation();

  const onSubmit: SubmitHandler<CreateMaterialInputType> = (data) => {
    if (material) {
      updateMaterial(
        {
          ...data,
          id: material.id,
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
              description: "Nguyên liệu đã được cập nhật thành công.",
            });
          },
        }
      );

      return;
    }

    mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
        if (onMaterialAdded) {
          onMaterialAdded();
        }
        toast({
          title: "Thành công",
          description: "Nguyên liệu đã được thêm thành công.",
        });
      },
    });
  };

  useEffect(() => {
    if (isDialogOpen) {
      reset();
      resetMutation();
    }
  }, [isDialogOpen]);

  const units = [
    { value: "kg", label: "Kg" },
    { value: "g", label: "G" },
    { value: "ml", label: "Ml" },
    { value: "l", label: "L" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "unit", label: "Unit" },
  ];

  const origins = [
    { value: "vn", label: "Việt Nam" },
    { value: "cn", label: "Trung Quốc" },
    { value: "us", label: "Mỹ" },
    { value: "jp", label: "Nhật Bản" },
    { value: "other", label: "Khác" },
  ];

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={onClose}
      title={material ? "Cập nhật nguyên liệu" : "Tạo nguyên liệu"}
      description={
        material
          ? "Điền thông tin để cập nhật nguyên liệu. Nhấn nút Cập nhật nguyên liệu khi hoàn tất."
          : "Điền thông tin để tạo nguyên liệu mới. Nhấn nút Tạo nguyên liệu khi hoàn tất."
      }
      contentClassName="sm:max-w-[800px]"
    >
      <ScrollArea className="max-h-[70vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-4">
              <ImageUpload name="image" control={control} />

              <InputCustom
                control={control}
                name="name"
                label="Tên nguyên liệu"
                placeholder="Nhập tên nguyên liệu"
                required
                disabled={isPending}
              />

              <TextAreaCustom
                control={control}
                name="description"
                label="Chi tiết nguyên liệu"
                placeholder="Nhập chi tiết nguyên liệu"
                required
                disabled={isPending}
              />

              <InputCustom
                control={control}
                name="code"
                label="Mã nguyên liệu"
                placeholder="Nhập mã nguyên liệu"
                required
                disabled={isPending}
              />

              <div className="flex gap-2 flex-row w-full justify-between">
                <SelectCustom
                  options={units}
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
                  name="count"
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
                options={origins}
                control={control}
                name="origin"
                label="Xuất xứ"
                placeholder="Nhập xuất xứ"
                required
                disabled={isPending}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 ">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : material ? (
                  "Cập nhật nguyên liệu"
                ) : (
                  "Tạo nguyên liệu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
