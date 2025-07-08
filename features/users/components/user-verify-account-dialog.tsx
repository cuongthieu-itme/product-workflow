"use client";

import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dialog";
import { useVerifyAccountMutation } from "../hooks/useVerifyAccountMutation";
import { toast } from "sonner";

interface UserVerifyAccountDialogProps {
    onClose: () => void;
    userId: string;
}

export const UserVerifyAccountDialog = ({ userId, onClose, }: UserVerifyAccountDialogProps) => {
    const { mutate } = useVerifyAccountMutation();

    const handleVerifyAccount = () => {
        mutate(userId, {
            onSuccess: () => {
                toast.success("Duyệt tài khoản thành công!");
                onClose();
            },
            onError: (error) => {
                toast.error(error.message || "Duyệt tài khoản thất bại");
            },
        });
    };

    return (
        <BaseDialog open={!!userId} onClose={onClose}
            title="Duyệt tài khoản"
            description="Bạn có chắc chắn muốn duyệt tài khoản này?"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Huỷ</Button>
                    <Button variant="destructive" onClick={handleVerifyAccount}>Duyệt</Button>
                </div>
            }
        />
    );
};