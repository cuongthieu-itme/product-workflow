"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DepartmentType } from "../type";
import { useDeleteDepartmentMutation } from "../hooks";

interface DeleteDepartmentDialogProps {
  deletingDepartment: DepartmentType | null;
  setDeletingDepartment: (d: DepartmentType | null) => void;
}

export const DeleteDepartmentDialog = ({
  deletingDepartment,
  setDeletingDepartment,
}: DeleteDepartmentDialogProps) => {
  const { mutateAsync, isPending } = useDeleteDepartmentMutation();

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    try {
      await mutateAsync(deletingDepartment.id);
      toast.success("Xóa phòng ban thành công!");
      setDeletingDepartment(null);
    } catch (err: any) {
      toast.error(err.message || "Xóa phòng ban thất bại");
    }
  };

  return (
    <BaseDialog
      open={!!deletingDepartment}
      onClose={() => setDeletingDepartment(null)}
      title="Xác nhận xóa phòng ban"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa phòng ban ${deletingDepartment?.name}? Hành động này không thể hoàn tác.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingDepartment(null)}
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
    >
      <div className="text-red-500 text-sm">
        Lưu ý: Phòng ban này có {deletingDepartment?._count.members ?? 0} thành
        viên. Khi xóa phòng ban, các thành viên sẽ không còn thuộc phòng ban
        nào.
      </div>
    </BaseDialog>
  );
};
