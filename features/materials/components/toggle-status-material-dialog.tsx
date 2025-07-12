"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { MaterialType } from "../type";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useChangeStatusMaterialMutation } from "../hooks/useMaterials";

interface ToggleStatusMaterialDialogProps {
  changeStatusMaterial: MaterialType | null;
  setChangeStatusMaterial: (c: MaterialType | null) => void;
}

export const ToggleStatusMaterialDialog = ({
  changeStatusMaterial,
  setChangeStatusMaterial,
}: ToggleStatusMaterialDialogProps) => {
  const { mutate, isPending } = useChangeStatusMaterialMutation();

  const handleDelete = async () => {
    if (!changeStatusMaterial) return;
    mutate({ id: changeStatusMaterial.id, isActive: !changeStatusMaterial.isActive }, {
      onSuccess: () => {
        setChangeStatusMaterial(null);
      },
    });
  };

  return (
    <BaseDialog
      open={!!changeStatusMaterial}
      onClose={() => setChangeStatusMaterial(null)}
      title="Xác nhận thay đổi trạng thái nguyên liệu"
      description={
        <>
          Bạn có chắc chắn muốn thay đổi trạng thái nguyên liệu <span className="font-bold">{changeStatusMaterial?.name}</span> sang <span className="font-bold">{changeStatusMaterial?.isActive ? "còn hàng" : "hết hàng"}</span>?
        </>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setChangeStatusMaterial(null)}
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
