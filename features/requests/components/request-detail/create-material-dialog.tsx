import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

interface CreateMaterialDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateMaterialDialog = ({
  open,
  onClose,
}: CreateMaterialDialogProps) => {
  const { toast } = useToast();
  const requestId = useParams().id;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      // TODO: Thêm API call để chuyển đổi thành nguyên liệu
      // await convertToMaterial(requestId);

      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Thành công",
        description: "Đã chuyển đổi yêu cầu thành nguyên liệu thành công.",
      });

      queryClient.invalidateQueries();
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi chuyển đổi thành nguyên liệu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chuyển đổi thành nguyên liệu"
      description="Xác nhận chuyển đổi yêu cầu này thành nguyên liệu."
    >
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sau khi chuyển đổi, yêu cầu này sẽ trở thành nguyên liệu trong hệ
            thống. Hành động này không thể hoàn tác.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
          <Package className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">
            Yêu cầu sẽ được chuyển đổi thành nguyên liệu mới
          </span>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>
            Hủy
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Xác nhận chuyển đổi
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
};
