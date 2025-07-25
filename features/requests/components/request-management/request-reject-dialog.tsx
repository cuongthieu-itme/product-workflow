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
      title="Duyệt yêu cầu"
      contentClassName="sm:max-w-[800px]"
      description={`Bạn có chắc chắn muốn duyệt yêu cầu "${request?.title}" không?`}
    >
      <ScrollArea className="max-h-[50vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <p className="text-sm text-gray-700">
              <strong>Tên yêu cầu:</strong> {request?.title}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Mô tả:</strong> {request?.description}
            </p>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button disabled={isPending} onClick={handleReject}>
              {isPending ? "Đang xử lý..." : "Từ chối yêu cầu"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
};
