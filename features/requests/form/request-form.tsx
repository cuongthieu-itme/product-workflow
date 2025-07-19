"use client";

import type React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestInputSchema, RequestInputType } from "../schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useCreateRequestMutation } from "../hooks";
import { useToast } from "@/components/ui/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dialog";
import { useEffect } from "react";
import { ProductLinks } from "./product-links";
import { useCustomersQuery } from "@/features/customers/hooks";
import { SelectCustom } from "@/components/form/select";
import { UploadFile } from "@/components/common/upload";
import { MaterialSelector } from "./material/material-selector";
import { StatusProduct } from "./status-product";
import { MaterialForm } from "@/features/materials";
import { openMaterialDialogAtom } from "../requestAtom";
import { useAtom } from "jotai";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { getDepartmentRole } from "@/features/settings/utils";

interface RequestFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export function RequestForm({
  isDialogOpen,
  setIsDialogOpen,
}: RequestFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useAtom(openMaterialDialogAtom);

  const methods = useForm<RequestInputType>({
    defaultValues: {
      title: "",
      description: "",
      image: [],
      productLink: [
        {
          url: "",
        },
      ],
    },
    resolver: zodResolver(requestInputSchema),
  });

  const { control, handleSubmit, reset } = methods;

  const { mutate, isPending, isSuccess, error } = useCreateRequestMutation();

  const onSubmit: SubmitHandler<RequestInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        toast({
          title: "Thành công",
          description: "Yêu cầu đã được thêm thành công.",
        });
      },
    });
  };

  const { data: customer } = useCustomersQuery();

  const customerOptions =
    customer?.data.map((c) => ({
      value: c.id,
      label: c.fullName || c.email || "Khách hàng không xác định",
    })) || [];

  const { data: currentUser } = useGetUserInfoQuery();

  useEffect(() => {
    if (isDialogOpen) {
      reset();
    }
  }, [isDialogOpen]);

  return (
    <>
      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo yêu cầu mới"
        description="Điền thông tin để tạo yêu cầu mới. Nhấn nút Tạo yêu cầu khi hoàn tất."
        contentClassName="w-[600px] max-w-[800px]"
      >
        <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
          <div className="space-y-6 pr-4">
            {isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Tạo yêu cầu thành công!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Yêu cầu đã được tạo thành công và đã được thêm vào hệ thống.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {currentUser && (
              <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20" />

                <div className="relative">
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900">
                        Người tạo yêu cầu
                      </h3>
                      <p className="text-xs text-blue-600">
                        Thông tin người thực hiện
                      </p>
                    </div>
                  </div>

                  {/* User info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                        <svg
                          className="h-3 w-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-900">
                          {currentUser.fullName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100">
                        <svg
                          className="h-3 w-3 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2H8a2 2 0 00-2 2v9m8 0V9a2 2 0 012-2h2a2 2 0 012 2v12"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Phòng ban</div>
                        <div className="text-sm font-medium text-purple-700">
                          {getDepartmentRole(
                            currentUser.id,
                            currentUser?.department?.headId,
                            currentUser?.department?.id
                          )}
                        </div>
                      </div>
                    </div>

                    {currentUser.email && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100">
                          <svg
                            className="h-3 w-3 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600">Email</div>
                          <div className="text-sm font-medium text-green-700">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="space-y-4">
                  <SelectCustom
                    searchable
                    control={control}
                    name="customerId"
                    label="Khách hàng"
                    options={customerOptions}
                    placeholder="Chọn khách hàng"
                    required
                    disabled={isPending}
                  />

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
                    name="image"
                    label="Hình ảnh"
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
          </div>
        </ScrollArea>
      </BaseDialog>

      <MaterialForm isDialogOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
