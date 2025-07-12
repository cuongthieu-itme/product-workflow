"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { AccessoryType } from "../type";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteAccessoryMutation } from "../hooks/useAccessories";

interface DeleteAccessoryDialogProps {
    deletingAccessory: AccessoryType | null;
    setDeletingAccessory: (c: AccessoryType | null) => void;
}

export const DeleteAccessoryDialog = ({
    deletingAccessory,
    setDeletingAccessory,
}: DeleteAccessoryDialogProps) => {
    const { mutate, isPending } = useDeleteAccessoryMutation();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!deletingAccessory) return;
        mutate(deletingAccessory.id, {
            onSuccess: () => {
                toast({
                    title: "Thành công",
                    description: "Phụ kiện đã được xóa thành công.",
                });
                setDeletingAccessory(null);
            },
            onError: () => {
                toast({
                    title: "Lỗi",
                    description: "Xóa phụ kiện thất bại",
                });
                setDeletingAccessory(null);
            },
        })
    };

    return (
        <BaseDialog
            open={!!deletingAccessory}
            onClose={() => setDeletingAccessory(null)}
            title="Xác nhận xóa phụ kiện"
            contentClassName="sm:max-w-[320px]"
            description={`Bạn có chắc chắn muốn xóa phụ kiện ${deletingAccessory?.name}? Hành động này không thể hoàn tác.`}
            footer={
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setDeletingAccessory(null)}
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
