import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { RequestStatus, RequestType } from "../../type";
import { useRejectRequestMutation } from "../../hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rejectRequestInputSchema, RejectRequestInputType } from "../../schema";
import { TextAreaCustom } from "@/components/form/textarea";
import { UploadFile } from "@/components/common/upload";
import { Loader2 } from "lucide-react";

export const RequestRejectDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request?: RequestType;
}) => {
  const { mutate: rejectMutation, isPending } = useRejectRequestMutation();
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<RejectRequestInputType>({
    defaultValues: {
      denyReason: "",
      files: [],
      id: request?.id || 0,
      status: RequestStatus.REJECTED,
    },
    resolver: zodResolver(rejectRequestInputSchema),
  });

  const handleReject: SubmitHandler<RejectRequestInputType> = (data) => {
    if (!request?.id) return;

    rejectMutation(
      {
        ...data,
        id: request.id,
        status: RequestStatus.REJECTED,
      },
      {
        onSuccess: () => {
          toast({
            title: "Từ chối yêu cầu thành công",
            description: `Yêu cầu "${request.title}" đã được từ chối thành công.`,
          });
          reset();
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Lỗi từ chối yêu cầu",
            description: error.message || "Đã xảy ra lỗi khi từ chối yêu cầu.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Từ chối yêu cầu"
      contentClassName="max-w-[600px]"
      description={`Từ chối yêu cầu "${request?.title}"`}
    >
      <ScrollArea className="max-h-[70vh] overflow-y-auto pr-6">
        <form onSubmit={handleSubmit(handleReject)} className="space-y-6 py-4">
          <div className="space-y-6">
            {/* Request Info */}
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

            {/* Reject Reason */}
            <div className="space-y-4">
              <TextAreaCustom
                control={control}
                name="denyReason"
                label="Lý do từ chối"
                placeholder="Nhập lý do từ chối yêu cầu này..."
                required
                disabled={isPending}
                rows={4}
              />

              {/* Media Upload */}
              <UploadFile
                control={control}
                name="files"
                label="Hình ảnh/Video minh họa"
                maxFiles={5}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/webp": [".webp"],
                }}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận từ chối"
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </BaseDialog>
  );
};
