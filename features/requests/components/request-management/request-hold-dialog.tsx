import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { RequestType } from "../../type";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { holdRequestInputSchema, HoldRequestInputType } from "../../schema";
import { TextAreaCustom } from "@/components/form/textarea";
import { UploadFile } from "@/components/common/upload";
import { Loader2 } from "lucide-react";
import { useHoldRequestMutation } from "../../hooks/useRequest";

export const RequestHoldDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request?: RequestType;
}) => {
  const { toast } = useToast();
  const { mutate: holdMutation, isPending } = useHoldRequestMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<HoldRequestInputType>({
    defaultValues: {
      reason: "",
      media: [],
    },
    resolver: zodResolver(holdRequestInputSchema),
  });

  const handleHold: SubmitHandler<HoldRequestInputType> = async (data) => {
    if (!request?.id) return;

    holdMutation(
      { id: request.id, data },
      {
        onSuccess: () => {
          toast({
            title: "Hold yêu cầu thành công",
            description: `Yêu cầu "${request?.title}" đã được hold thành công.`,
          });

          reset();
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Lỗi hold yêu cầu",
            description: error.message || "Đã xảy ra lỗi khi hold yêu cầu.",
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
      title="Hold yêu cầu"
      contentClassName="max-w-[600px]"
      description={`Tạm dừng yêu cầu "${request?.title}"`}
    >
      <ScrollArea className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleHold)} className="space-y-6 py-4">
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

            {/* Hold Reason */}
            <div className="space-y-4">
              <TextAreaCustom
                control={control}
                name="reason"
                label="Lý do hold"
                placeholder="Nhập lý do tạm dừng yêu cầu này..."
                required
                disabled={isPending}
                rows={4}
              />

              {/* Media Upload */}
              <UploadFile
                control={control}
                name="media"
                label="Hình ảnh/Video minh họa"
                maxFiles={5}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/webp": [".webp"],
                  "video/mp4": [".mp4"],
                  "video/quicktime": [".mov"],
                  "video/x-msvideo": [".avi"],
                  "video/x-ms-wmv": [".wmv"],
                  "video/3gpp": [".3gp"],
                  "video/3gpp2": [".3g2"],
                  "video/mp2t": [".ts"],
                  "video/ogg": [".ogv"],
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
                "Xác nhận Hold"
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </BaseDialog>
  );
};
