"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { useState } from "react";
import { BaseDialog } from "@/components/dialog";
import { createCategoryInputSchema, CreateCategoryInputType } from "../schema";
import { useCreateCategoryMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";

export function CreateCategoryForm({
  onCategoryAdded,
}: {
  onCategoryAdded?: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<CreateCategoryInputType>({
    defaultValues: {
      description: "",
      name: "",
    },
    resolver: zodResolver(createCategoryInputSchema),
  });

  const { mutate, isPending, isSuccess, error, data } =
    useCreateCategoryMutation();

  const onSubmit: SubmitHandler<CreateCategoryInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
        toast({
          title: "Thành công",
          description: "Danh mục đã được thêm thành công.",
        });
        if (onCategoryAdded) {
          onCategoryAdded();
        }
      },
    });
  };

  return (
    <>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo mới danh mục
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Thêm mới danh mục"
      >
        {isSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Thêm mới thành công!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {data.message || "Danh mục đã được thêm thành công."}
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

        <ScrollArea className="h-[600px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 ">
              <InputCustom
                name="name"
                control={control}
                placeholder="Nhập tên danh mục"
                label="Tên danh mục"
                required
                disabled={isPending}
              />

              <InputCustom
                name="description"
                control={control}
                placeholder="Nhập mô tả"
                label="Mô tả"
                disabled={isPending}
              />
            </div>
            <DialogFooter className="mt-6 flex justify-end space-x-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm mới danh mục
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </BaseDialog>
    </>
  );
}
