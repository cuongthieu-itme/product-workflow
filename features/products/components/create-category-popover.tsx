"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/form/input";
import { useToast } from "@/components/ui/use-toast";
import { useCreateCategoryMutation } from "@/features/categories/hooks";
import {
  createCategoryInputSchema,
  CreateCategoryInputType,
} from "@/features/categories/schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

interface CreateCategoryPopoverProps {
  onCategoryCreated?: () => void;
}

export function CreateCategoryPopover({
  onCategoryCreated,
}: CreateCategoryPopoverProps) {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    resolver: zodResolver(createCategoryInputSchema),
  });

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const { mutate, isPending } = useCreateCategoryMutation();

  const onSubmit: SubmitHandler<CreateCategoryInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Danh mục đã được tạo thành công.",
        });
        reset();
        if (onCategoryCreated) {
          onCategoryCreated();
        }
        handleClose();
      },
      onError: (err) => {
        toast({
          title: "Lỗi",
          description: err?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          variant: "destructive",
        });
        handleClose();
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form className="space-y-4">
          <div className="space-y-2">
            <InputCustom
              name="name"
              label="Tên danh mục"
              control={control}
              placeholder="Nhập tên danh mục"
              required
            />
            <InputCustom
              name="description"
              label="Mô tả"
              control={control}
              placeholder="Nhập mô tả danh mục"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button disabled={isPending} onClick={handleSubmit(onSubmit)}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo mới"
              )}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
