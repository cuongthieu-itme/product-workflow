import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { TextAreaCustom } from "@/components/form/textarea";
import {
  createProductInputSchema,
  CreateProductInputType,
} from "@/features/products/schema";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateProductMutation } from "@/features/products/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { on } from "events";

interface CreateProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<CreateProductInputType>;
}

export const CreateProductFormDialog = ({
  open,
  onClose,
  defaultValues,
}: CreateProductFormDialogProps) => {
  const { toast } = useToast();
  const requestId = useParams().id;
  const { control, handleSubmit } = useForm<CreateProductInputType>({
    defaultValues: {
      categoryId: undefined,
      description: "",
      name: "",
      sku: "",
      manufacturingProcess: defaultValues?.manufacturingProcess || "",
      ...defaultValues,
    },
    resolver: zodResolver(createProductInputSchema),
  });

  const {
    mutate,

    reset: resetMutation,
  } = useCreateProductMutation();

  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<CreateProductInputType> = (data) => {
    mutate(
      {
        ...data,
        requestId: Number(requestId),
      },
      {
        onSuccess: () => {
          resetMutation();
          toast({
            title: "Thành công",
            description: "Sản phẩm đã được thêm thành công.",
          });
          onClose();
          queryClient.invalidateQueries();
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const { data: categories } = useCategoriesQuery({ limit: 10000 });
  const categoryOptions =
    categories?.data.map((category) => ({
      value: category.id,
      label: category.name,
    })) ?? [];

  const handleFormSubmit: SubmitHandler<CreateProductInputType> = (data) => {
    onSubmit(data);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Tạo sản phẩm mới"
      description="Điền thông tin để tạo sản phẩm mới từ yêu cầu."
    >
      <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-4">
              <InputCustom
                control={control}
                name="sku"
                label="Mã sản phẩm"
                placeholder="Nhập mã sản phẩm"
                required
              />

              <InputCustom
                control={control}
                name="name"
                label="Tên sản phẩm"
                placeholder="Nhập tên sản phẩm"
                required
              />

              <TextAreaCustom
                control={control}
                name="description"
                label="Chi tiết sản phẩm"
                placeholder="Nhập chi tiết sản phẩm"
                required
              />

              <TextAreaCustom
                control={control}
                name="manufacturingProcess"
                label="Quy trình sản xuất"
                placeholder="Nhập quy trình sản xuất"
              />

              <SelectCustom
                valueType="number"
                name="categoryId"
                control={control}
                label="Danh mục sản phẩm"
                options={categoryOptions}
                required
                placeholder="Chọn danh mục sản phẩm"
                emptyOption={{
                  label: "Chọn danh mục sản phẩm",
                }}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit">Tạo sản phẩm</Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
