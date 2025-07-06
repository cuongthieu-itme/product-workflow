"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteUserMutation } from "../hooks/useDeleteUserMutation";
import { User } from "../type";
import { toast } from "sonner";

interface DeleteUserDialogProps {
    deletingUser: User | null;
    setDeletingUser: (u: User | null) => void;
}

export const DeleteUserDialog = ({
    deletingUser,
    setDeletingUser,
}: DeleteUserDialogProps) => {
    const { mutateAsync, isPending } = useDeleteUserMutation();

    const handleDelete = async () => {
        if (!deletingUser) return;
        try {
            await mutateAsync(deletingUser.id);
            toast.success("Xóa người dùng thành công!");
            setDeletingUser(null);
        } catch (err: any) {

            toast.error(err.message || "Xóa người dùng thất bại");
        }
    };

    return (
        <BaseDialog
            open={!!deletingUser}
            onClose={() => setDeletingUser(null)}
            title="Xác nhận xóa"
            contentClassName="sm:max-w-[320px]"
            description={`Bạn có chắc chắn muốn xóa tài khoản người dùng ${deletingUser?.userName || "này"}? Hành động này không thể hoàn tác.`}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={isPending}>
                        Huỷ
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        Xoá
                    </Button>
                </div>
            }
        />
    );
};
