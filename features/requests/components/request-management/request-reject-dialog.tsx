import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { RequestType } from "../../type";
import { useRejectRequestMutation } from "../../hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export const RequestRejectDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request?: RequestType;
}) => {
  const { mutate, isPending } = useRejectRequestMutation();
  const { toast } = useToast();

  const handleReject = () => {
    if (!request?.id) return;

    mutate(request.id, {
      onSuccess: () => {
        toast({
          title: "Từ chối yêu cầu thành công",
          description: `Yêu cầu "${request.title}" đã được từ chối thành công.`,
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Lỗi từ chối yêu cầu",
          description: error.message || "Đã xảy ra lỗi khi từ chối yêu cầu.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Từ chối yêu cầu"
      contentClassName="max-w-[30vw]"
      description={`Bạn có chắc chắn muốn từ chối yêu cầu "${request?.title}" không?`}
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
              onClick={handleReject}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
