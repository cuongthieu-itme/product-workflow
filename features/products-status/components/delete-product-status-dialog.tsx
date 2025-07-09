"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { ProductStatusType } from "../types";
import { useDeleteProductStatusMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface DeleteProductStatusDialogProps {
  deletingProduct: ProductStatusType | null;
  setDeletingProduct: (c: ProductStatusType | null) => void;
}

export const DeleteProductStatusDialog = ({
  deletingProduct,
  setDeletingProduct,
}: DeleteProductStatusDialogProps) => {
  const { mutateAsync, isPending } = useDeleteProductStatusMutation();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await mutateAsync(deletingProduct.id);
      toast({
        title: "Thành công",
        description: "Trạng thái sản phẩm đã được xóa thành công.",
      });
      setDeletingProduct(null);
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Xóa trạng thái sản phẩm thất bại",
      });
    }
  };

  return (
    <BaseDialog
      open={!!deletingProduct}
      onClose={() => setDeletingProduct(null)}
      title="Xác nhận xóa trạng thái"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa trạng thái sản phẩm ${deletingProduct?.name}? Hành động này không thể hoàn tác.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingProduct(null)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </div>
      }
    />
  );
};
