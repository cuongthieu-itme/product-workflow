import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pause, Loader2 } from "lucide-react";
import { useHoldSubprocessMutation } from "@/features/requests/hooks/useRequest";

interface HoldSubprocessDialogProps {
  subprocessId: number;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const HoldSubprocessDialog: React.FC<HoldSubprocessDialogProps> = ({
  subprocessId,
  children,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const holdSubprocess = useHoldSubprocessMutation();

  const handleHold = async () => {
    setIsSubmitting(true);
    try {
      await holdSubprocess.mutateAsync({ id: subprocessId });
      toast({
        title: "Thành công",
        description: "Đã tạm dừng subprocess!",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạm dừng subprocess!",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            disabled={disabled}
            variant="secondary"
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
          >
            <Pause className="w-4 h-4 mr-2" />
            Tạm dừng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạm dừng subprocess</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn tạm dừng subprocess này không?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleHold}
            disabled={isSubmitting}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Pause className="w-4 h-4 mr-2" />
            )}
            Tạm dừng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
