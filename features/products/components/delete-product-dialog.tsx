"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductType } from "../types";
import { useDeleteProductMutation } from "../hooks";

interface DeleteProductDialogProps {
  deletingProduct: ProductType | null;
  setDeletingCustomer: (c: ProductType | null) => void;
}

export const DeleteProductDialog = ({
  deletingProduct,
  setDeletingCustomer,
}: DeleteProductDialogProps) => {
  const { mutateAsync, isPending } = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await mutateAsync(deletingProduct.id);
      toast.success("Xóa sản phẩm thành công!");
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Xóa sản phẩm thất bại");
    }
  };

  return (
    <BaseDialog
      open={!!deletingProduct}
      onClose={() => setDeletingCustomer(null)}
      title="Xác nhận xóa sản phẩm"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa sản phẩm ${deletingProduct?.name}? Hành động này không thể hoàn tác.`}
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
