import { BaseDialog } from "@/components/dialog";
import { useAtom } from "jotai";
import {
  openCustomerFormDialogAtom,
  openSourceFormDialogAtom,
} from "../../requestAtom";
import { SubmitHandler, useForm } from "react-hook-form";
import { sourceOtherInputSchema, SourceOtherInputType } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSourceOtherMutation } from "../../hooks/useRequest";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";

export const SourceFormDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useAtom(openSourceFormDialogAtom);
  const { control, reset, handleSubmit } = useForm<SourceOtherInputType>({
    defaultValues: {
      name: "",
      specifically: "",
    },
    resolver: zodResolver(sourceOtherInputSchema),
  });

  const { mutate, isPending } = useCreateSourceOtherMutation();

  const onSubmit: SubmitHandler<SourceOtherInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      title="Tạo nguồn mới"
      description="Điền thông tin để tạo nguồn mới. Nhấn nút Tạo nguồn khi hoàn tất."
      contentClassName="sm:max-w-[400px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-4">
          <InputCustom
            control={control}
            name="name"
            label="Tên nguồn"
            placeholder="Nhập tên nguồn"
            required
            disabled={isPending}
          />

          <TextAreaCustom
            control={control}
            name="specifically"
            label="Thông tin cụ thể"
            placeholder="Nhập thông tin cụ thể"
            required
            disabled={isPending}
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Tạo nguồn"
            )}
          </Button>
        </DialogFooter>
      </form>
    </BaseDialog>
  );
};
