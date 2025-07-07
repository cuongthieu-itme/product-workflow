import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import React from "react";
import { User } from "../type";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface RejectUserDialogProps {
  userToReject: User | null;
  setShowRejectDialog: (show: boolean) => void;
}

export const RejectUserDialog: React.FC<RejectUserDialogProps> = ({
  setShowRejectDialog,
  userToReject,
}) => {
  return (
    <Dialog open={!!userToReject} onOpenChange={setShowRejectDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Từ chối tài khoản</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối tài khoản {userToReject?.userName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reject-reason" className="text-right">
              Lý do từ chối
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Nhập lý do từ chối tài khoản"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            // onClick={handleRejectUser}
            // disabled={isLoading || !rejectReason}
          >
            {false ? "Đang xử lý..." : "Từ chối tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
