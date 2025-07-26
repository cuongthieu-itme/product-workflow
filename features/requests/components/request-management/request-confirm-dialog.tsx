import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { RequestStatus, RequestType } from "../../type";
import { useChangeStatusRequestMutation } from "../../hooks/useRequest";
import { useGetWorkflowProcessByIdQuery } from "@/features/workflows/hooks";
import { ConfirmRequestInputType } from "../../schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useProductsStatusQuery } from "@/features/products-status/hooks";
import { SelectCustom } from "@/components/form";
import { Calendar, Check, Clock, Info, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequestConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  request?: RequestType;
}

export const RequestConfirmDialog = ({
  open,
  onClose,
  request,
}: RequestConfirmDialogProps) => {
  const {
    mutate: changeStatusRequestMutation,
    isPending: isChangeStatusPending,
  } = useChangeStatusRequestMutation();

  const { toast } = useToast();
  const { control, handleSubmit, watch, reset } =
    useForm<ConfirmRequestInputType>({
      defaultValues: {
        statusProductId: undefined,
        id: request?.id,
        status: RequestStatus.APPROVED,
      },
    });
  const { data: statusProduct } = useProductsStatusQuery();

  // Xử lý form submit
  const onSubmit: SubmitHandler<ConfirmRequestInputType> = (data) => {
    if (!request?.id) return;

    changeStatusRequestMutation(
      {
        ...data,
        id: request.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Duyệt yêu cầu thành công",
            description: `Yêu cầu "${request.title}" đã được duyệt thành công.`,
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Lỗi duyệt yêu cầu",
            description: error.message || "Đã xảy ra lỗi khi duyệt yêu cầu.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Danh sách trạng thái sản phẩm
  const options =
    statusProduct?.data?.map((status) => ({
      value: status.id,
      label: status.name,
    })) ?? [];

  // Trạng thái được chọn
  const selectedStatus = statusProduct?.data?.find(
    (option) => option.id == watch("statusProductId")
  );

  // Lấy thông tin quy trình của trạng thái
  const { data: process } = useGetWorkflowProcessByIdQuery(
    selectedStatus?.procedure.id
  );

  // Reset form khi dialog mở
  useEffect(() => {
    reset();
  }, [open, reset]);

  return (
    <BaseDialog
      width="60vw"
      open={open}
      onClose={onClose}
      title="Duyệt yêu cầu"
      contentClassName="sm:max-w-[800px]"
      description={
        <div className="flex items-center gap-2 text-amber-600">
          <Info className="h-4 w-4" />
          Xác nhận duyệt yêu cầu và chọn trạng thái sản phẩm
        </div>
      }
    >
      <ScrollArea className="max-h-[70vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Thông tin yêu cầu */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Badge className="bg-blue-500 px-2 py-1 text-xs font-medium">
                  Thông tin yêu cầu
                </Badge>
                <h3 className="font-medium text-primary">{request?.title}</h3>
              </div>
              {request?.description && (
                <p className="text-sm text-muted-foreground">
                  {request.description}
                </p>
              )}
            </div>

            {/* Chọn trạng thái sản phẩm */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <SelectCustom
                valueType="number"
                control={control}
                name="statusProductId"
                options={options}
                label="Trạng thái Sản phẩm"
                placeholder="Chọn trạng thái Sản phẩm"
              />
            </div>

            {/* Hiển thị quy trình */}
            {process && (
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Badge className="bg-green-500 px-2 py-1 text-xs font-medium">
                    Quy trình xử lý
                  </Badge>
                </div>

                <div className="relative mt-4 space-y-4">
                  {process.subprocesses.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Không có bước xử lý nào trong quy trình này
                    </p>
                  ) : (
                    <div className="relative">
                      {/* Timeline */}
                      <div className="absolute left-[22px] top-8 bottom-0 w-[2px] bg-border" />

                      {/* Steps */}
                      {process?.subprocesses.map((step, index) => (
                        <div key={step.id} className="relative mb-2 pl-12 pb-4">
                          {/* Step indicator */}
                          <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/20 bg-background text-primary">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>

                          {/* Step content */}
                          <div className="rounded-lg border border-border bg-card/50 p-3 hover:bg-card/80 transition-colors">
                            <h4 className="text-sm font-medium">{step.name}</h4>

                            {step.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {step.description}
                              </p>
                            )}

                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{step.estimatedNumberOfDays} ngày</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span>{step.roleOfThePersonInCharge}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isChangeStatusPending}
                className="h-9 px-4"
              >
                {isChangeStatusPending ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Đang xử lý
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Xác nhận
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </ScrollArea>
    </BaseDialog>
  );
};
