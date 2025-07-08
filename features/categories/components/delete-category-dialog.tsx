"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CategoryType } from "../types";
import { useDeleteCategoryMutation } from "../hooks";

interface DeleteCategoryDialogProps {
  deletingProduct: CategoryType | null;
  setDeletingCustomer: (c: CategoryType | null) => void;
}

export const DeleteCategoryDialog = ({
  deletingProduct,
  setDeletingCustomer,
}: DeleteCategoryDialogProps) => {
  const { mutateAsync, isPending } = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await mutateAsync(deletingProduct.id);
      toast.success("Xóa danh mục thành công!");
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Xóa danh mục thất bại");
    }
  };

  return (
    <BaseDialog
      open={!!deletingProduct}
      onClose={() => setDeletingCustomer(null)}
      title="Xác nhận xóa danh mục"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa danh mục ${deletingProduct?.name}? Hành động này không thể hoàn tác.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingCustomer(null)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Xoá
          </Button>
        </div>
      }
    />
  );
};
