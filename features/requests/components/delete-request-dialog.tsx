import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React from "react";
import { Button } from "react-day-picker";

interface DeleteRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteRequestDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogDescription>
          Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn
          tác.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button>Hủy</Button>
        <Button>{false ? "Đang xóa..." : "Xóa"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
