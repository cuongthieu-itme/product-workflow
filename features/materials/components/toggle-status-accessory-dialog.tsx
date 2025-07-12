"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { AccessoryType } from "../type";
import { Loader2 } from "lucide-react";
import { useChangeStatusAccessoryMutation } from "../hooks/useAccessories";

interface ToggleStatusAccessoryDialogProps {
  changeStatusAccessory: AccessoryType | null;
  setChangeStatusAccessory: (c: AccessoryType | null) => void;
}

export const ToggleStatusAccessoryDialog = ({
  changeStatusAccessory,
  setChangeStatusAccessory,
}: ToggleStatusAccessoryDialogProps) => {
  const { mutate, isPending } = useChangeStatusAccessoryMutation();

  const handleDelete = async () => {
    if (!changeStatusAccessory) return;
    mutate({ id: changeStatusAccessory.id, isActive: !changeStatusAccessory.isActive }, {
      onSuccess: () => {
        setChangeStatusAccessory(null);
      },
    });
  };

  return (
    <BaseDialog
      open={!!changeStatusAccessory}
      onClose={() => setChangeStatusAccessory(null)}
      title="Xác nhận thay đổi trạng thái phụ kiện"
      description={
        <>
          Bạn có chắc chắn muốn thay đổi trạng thái phụ kiện <span className="font-bold">{changeStatusAccessory?.name}</span> sang <span className="font-bold">{changeStatusAccessory?.isActive ? "hết hàng" : "còn hàng"}</span>?
        </>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setChangeStatusAccessory(null)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            variant="default"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Thay đổi"
            )}
          </Button>
        </div>
      }
    />
  );
};
