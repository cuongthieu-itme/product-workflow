import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Pause, Loader2 } from "lucide-react";
import { useHoldSubprocessMutation } from "@/features/requests/hooks/useRequest";
import {
  holdSubprocessSchema,
  HoldSubprocessInputType,
} from "@/features/requests/schema";

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
  const { toast } = useToast();
  const holdSubprocess = useHoldSubprocessMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HoldSubprocessInputType>({
    resolver: zodResolver(holdSubprocessSchema),
    defaultValues: {
      id: subprocessId,
    },
  });

  const onSubmit = async (data: HoldSubprocessInputType) => {
    try {
      await holdSubprocess.mutateAsync(data);
      toast({
        title: "Thành công",
        description: "Đã tạm dừng subprocess!",
      });
      setOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạm dừng subprocess!",
        variant: "destructive",
      });
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
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
};
