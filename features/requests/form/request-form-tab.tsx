"use client";

import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestInputSchema, RequestInputType } from "../schema";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useCreateRequestMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProductLinks } from "./product-links";
import { UploadFile } from "@/components/common/upload";
import { MaterialSelector } from "./material/material-selector";
import { CustomerSelect } from "./customer";
import { SourceEnum } from "../constants";
import { sourceAtom } from "../requestAtom";
import { useAtomValue } from "jotai";
import { SourceSelect } from "./source-other";

interface RequestFormTabProps {
  onSuccess: () => void;
}

export const RequestFormTab = ({ onSuccess }: RequestFormTabProps) => {
  const sourceSelected = useAtomValue(sourceAtom);
  const { toast } = useToast();

  const methods = useForm<RequestInputType>({
    defaultValues: {
      title: "",
      description: "",
      productLink: [{ url: "" }],
      media: [],
      source: sourceSelected,
      customerId: undefined,
      materials: [],
    },
    resolver: zodResolver(requestInputSchema),
  });

  const { control, handleSubmit, reset } = methods;

  const { mutate, isPending } = useCreateRequestMutation();

  const onSubmit: SubmitHandler<RequestInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        toast({
          title: "Thành công",
          description: "Yêu cầu đã được thêm thành công.",
        });
        onSuccess();
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-4">
          {sourceSelected === SourceEnum.OTHER ? (
            <SourceSelect />
          ) : (
            <CustomerSelect />
          )}

          <InputCustom
            control={control}
            name="title"
            label="Tiêu đề"
            placeholder="Nhập tiêu đề"
            required
            disabled={isPending}
          />

          <TextAreaCustom
            control={control}
            name="description"
            label="Chi tiết yêu cầu"
            placeholder="Nhập chi tiết yêu cầu"
            required
            rows={5}
            disabled={isPending}
          />

          <ProductLinks />

          <UploadFile
            control={control}
            name="media"
            label="Hình ảnh hoặc video"
            disabled={isPending}
          />

          <MaterialSelector />
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
              "Tạo yêu cầu"
            )}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};
