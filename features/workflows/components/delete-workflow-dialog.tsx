"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { WorkFlowProcessType } from "../types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteWFPMutation } from "../hooks/useWorkFlowProcess";

interface DeleteWorkflowDialogProps {
  deletingWorkflow: WorkFlowProcessType | null;
  setDeletingWorkflow: (w: WorkFlowProcessType | null) => void;
}

export const DeleteWorkflowDialog = ({
  deletingWorkflow,
  setDeletingWorkflow,
}: DeleteWorkflowDialogProps) => {
  const { mutate, isPending } = useDeleteWFPMutation();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingWorkflow) return;
    mutate(deletingWorkflow.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Quy trình đã được xóa thành công.",
        });
        setDeletingWorkflow(null);
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Xóa quy trình thất bại",
        });
      },
    });
  };

  return (
    <BaseDialog
      open={!!deletingWorkflow}
      onClose={() => setDeletingWorkflow(null)}
      title="Xác nhận xóa quy trình"
      contentClassName="sm:max-w-[320px]"
      description={`Bạn có chắc chắn muốn xóa quy trình ${deletingWorkflow?.name}? Hành động này không thể hoàn tác.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingWorkflow(null)}
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
