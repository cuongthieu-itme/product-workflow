import React from "react";
import { RequestType } from "../type";
import { BaseDialog } from "@/components/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteRequestMutation } from "../hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface DeleteRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestType;
}

export const DeleteRequestDialog: React.FC<DeleteRequestDialogProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { mutate: deleteRequest, isPending } = useDeleteRequestMutation();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!request?.id) return;

    deleteRequest(request.id, {
      onSuccess: () => {
        toast({
          title: "Xóa yêu cầu thành công",
          description: `Yêu cầu "${request.title}" đã được xóa thành công.`,
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Lỗi khi xóa yêu cầu",
          description: error.message || "Đã xảy ra lỗi khi xóa yêu cầu.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <BaseDialog
      open={isOpen}
      onClose={onClose}
      title="Xóa yêu cầu"
      contentClassName="sm:max-w-[600px]"
      description={`Bạn có chắc chắn muốn xóa yêu cầu "${request?.title}" không?`}
    >
      <ScrollArea className="max-h-[50vh] overflow-y-auto">
        <div className="space-y-6 py-4">
          <div className="grid gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">
                Thông tin yêu cầu
              </h3>
              <div className="grid gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tên yêu cầu
                  </p>
                  <p className="text-sm text-gray-900">{request?.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mô tả</p>
                  <p className="text-sm text-gray-900">
                    {request?.description || "Không có mô tả"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận xóa"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
