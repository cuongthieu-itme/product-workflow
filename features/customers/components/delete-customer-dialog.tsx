"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerType } from "../type";
import { useDeleteCustomerMutation } from "../hooks";

interface DeleteCustomerDialogProps {
  deletingCustomer: CustomerType | null;
  setDeletingCustomer: (c: CustomerType | null) => void;
}

export const DeleteCustomerDialog = ({
  deletingCustomer,
  setDeletingCustomer,
}: DeleteCustomerDialogProps) => {
  const { mutateAsync, isPending } = useDeleteCustomerMutation();

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await mutateAsync(deletingCustomer.id);
      toast.success("Xóa khách hàng thành công!");
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Xóa khách hàng thất bại");
    }
  };

  return (
    <BaseDialog
      open={!!deletingCustomer}
      onClose={() => setDeletingCustomer(null)}
      title="Xác nhận xóa khách hàng"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa khách hàng ${deletingCustomer?.fullName}? Hành động này không thể hoàn tác.`}
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
