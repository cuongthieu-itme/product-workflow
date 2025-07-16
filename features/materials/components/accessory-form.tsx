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
import { UploadFile } from "@/components/common/upload";
import { Fragment, useEffect, useState } from "react";
import { BaseDialog } from "@/components/dialog";
import { accessoryInputSchema, AccessoryInputType } from "../schema";
import {
  useCreateAccessoryMutation,
  useUpdateAccessoryMutation,
} from "../hooks";
import { TextAreaCustom } from "@/components/form/textarea";
import { AccessoryType } from "../type";
import { useToast } from "@/components/ui/use-toast";

export function CreateAccessoryForm({
  accessory,
  children,
}: {
  accessory?: AccessoryType;
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
          Tạo phụ kiện
        </Button>
      )}

      <AccessoryForm
        accessory={accessory}
        isDialogOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Fragment>
  );
}

interface AccessoryFormProps {
  accessory?: AccessoryType;
  isDialogOpen: boolean;
  onClose: () => void;
}

export const AccessoryForm: React.FC<AccessoryFormProps> = ({
  accessory,
  isDialogOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<AccessoryInputType>({
    defaultValues: {
      code: accessory?.code || "",
      name: accessory?.name || "",
      image: accessory?.image || [],
      description: accessory?.description || "",
      isActive: accessory?.isActive !== undefined ? accessory.isActive : true,
      quantity: accessory?.quantity || 0,
    },
    resolver: zodResolver(accessoryInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    reset: resetMutation,
  } = useCreateAccessoryMutation();

  const { mutate: updateMaterial } = useUpdateAccessoryMutation();

  const onSubmit: SubmitHandler<AccessoryInputType> = (data) => {
    if (accessory) {
      updateMaterial(
        {
          ...data,
          id: accessory.id,
        },
        {
          onSuccess: () => {
            reset();
            onClose();

            toast({
              title: "Thành công",
              description: "Phụ kiện đã được cập nhật thành công.",
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

        toast({
          title: "Thành công",
          description: "Phụ kiện đã được thêm thành công.",
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

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={onClose}
      title={accessory ? "Cập nhật phụ kiện" : "Tạo phụ kiện"}
      description={
        accessory
          ? "Điền thông tin để cập nhật phụ kiện. Nhấn nút Cập nhật phụ kiện khi hoàn tất."
          : "Điền thông tin để tạo phụ kiện mới. Nhấn nút Tạo phụ kiện khi hoàn tất."
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
              <UploadFile
                name="image"
                control={control}
                accept={{
                  "image/*": [".jpg", ".jpeg", ".png", ".gif"],
                  "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm"],
                }}
              />

              <InputCustom
                control={control}
                name="name"
                label="Tên phụ kiện"
                placeholder="Nhập tên phụ kiện"
                required
                disabled={isPending}
              />

              <TextAreaCustom
                control={control}
                name="description"
                label="Chi tiết phụ kiện"
                placeholder="Nhập chi tiết phụ kiện"
                disabled={isPending}
              />

              <InputCustom
                control={control}
                name="quantity"
                label="Số lượng"
                placeholder="Nhập số lượng"
                type="number"
                disabled={isPending}
              />

              <InputCustom
                control={control}
                name="code"
                label="Mã phụ kiện"
                placeholder="Nhập mã phụ kiện"
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
                ) : accessory ? (
                  "Cập nhật phụ kiện"
                ) : (
                  "Tạo phụ kiện"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
