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
import { RequestDetail } from "../type";
import { toRequestFormInput } from "../helpers";
import { useUpdateRequestMutation } from "../hooks/useRequest";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { useEffect } from "react";
import { SelectCustom } from "@/components/form";
import { priorityOptions } from "../options";

interface RequestFormTabProps {
  onSuccess: () => void;
  defaultValues?: RequestDetail;
}

export const RequestFormTab = ({
  onSuccess,
  defaultValues,
}: RequestFormTabProps) => {
  const sourceSelected = useAtomValue(sourceAtom);
  const { toast } = useToast();
  const { data: user } = useGetUserInfoQuery();

  const methods = useForm<RequestInputType>({
    defaultValues: toRequestFormInput({
      detail: defaultValues,
      sourceSelected,
    }),
    resolver: zodResolver(requestInputSchema),
  });

  const { control, handleSubmit, reset } = methods;

  const { mutate, isPending } = useCreateRequestMutation();
  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdateRequestMutation();

  useEffect(() => {
    if (defaultValues?.id) {
      reset(
        toRequestFormInput({
          detail: defaultValues,
          sourceSelected,
        })
      );
    }
  }, [defaultValues, reset, sourceSelected]);

  const onSubmit: SubmitHandler<RequestInputType> = (data) => {
    if (defaultValues?.id) {
      updateMutate(
        { ...data, id: defaultValues.id },
        {
          onSuccess: () => {
            toast({
              title: "Cập nhật yêu cầu thành công",
              description: "Yêu cầu đã được cập nhật thành công.",
            });
            reset();
            onSuccess();
          },
          onError: (error) => {
            toast({
              title: "Cập nhật yêu cầu thất bại",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );

      return;
    }
    mutate(
      {
        ...data,
        createdById: user?.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Tạo yêu cầu thành công",
            description: "Yêu cầu đã được tạo thành công.",
          });
          reset();
          onSuccess();
        },
        onError: (error) => {
          toast({
            title: "Tạo yêu cầu thất bại",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
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
            disabled={isPending || isUpdatePending}
          />

          <TextAreaCustom
            control={control}
            name="description"
            label="Chi tiết yêu cầu"
            placeholder="Nhập chi tiết yêu cầu"
            required
            rows={5}
            disabled={isPending || isUpdatePending}
          />

          <SelectCustom
            control={control}
            name="priority"
            options={priorityOptions}
            label="Độ ưu tiên"
          />

          <ProductLinks />

          <UploadFile
            control={control}
            name="media"
            label="Hình ảnh hoặc video"
            disabled={isPending || isUpdatePending}
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
              "video/webm": [".webm"],
            }}
          />

          <MaterialSelector />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending || isUpdatePending}>
            {isPending || isUpdatePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : defaultValues?.id ? (
              "Cập nhật yêu cầu"
            ) : (
              "Tạo yêu cầu"
            )}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};
