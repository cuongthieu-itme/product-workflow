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
    mutate(changeStatusMaterial.id);
  };

  return (
    <BaseDialog
      open={!!changeStatusMaterial}
      onClose={() => setChangeStatusMaterial(null)}
      title="Xác nhận thay đổi trạng thái nguyên liệu"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn thay đổi trạng thái nguyên liệu ${changeStatusMaterial?.name}? `}
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
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang thay đổi trạng thái...
              </>
            ) : (
              "Thay đổi trạng thái"
            )}
          </Button>
        </div>
      }
    />
  );
};
