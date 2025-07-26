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
import {
  Calendar,
  Check,
  Clock,
  Coins,
  Info,
  ListChecks,
  User,
} from "lucide-react";
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
              <div className="rounded-lg border bg-card p-4 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 px-2 py-1 text-xs font-medium flex items-center gap-1">
                      <ListChecks className="w-3 h-3" />
                      Quy trình xử lý
                    </Badge>
                    <h3 className="text-sm font-medium text-primary">
                      {process.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal px-2">
                    {process.subprocesses.length} bước
                  </Badge>
                </div>

                {process.description && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    {process.description}
                  </p>
                )}

                <div className="relative mt-6 space-y-4">
                  {process.subprocesses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Info className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Không có bước xử lý nào trong quy trình này
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vui lòng chọn quy trình khác hoặc liên hệ quản trị viên
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline */}
                      <div className="absolute left-[22px] top-8 bottom-8 w-[2px] bg-primary/20" />

                      {/* Steps */}
                      {process?.subprocesses.map((step, index) => (
                        <div key={step.id} className="relative mb-6 pl-12">
                          {/* Step indicator */}
                          <div
                            className={cn(
                              "absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm",
                              index === 0
                                ? "border-primary bg-primary text-white"
                                : "border-primary/30 bg-background text-primary"
                            )}
                          >
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>

                          {/* Step content */}
                          <div
                            className={cn(
                              "rounded-lg border p-4 transition-all",
                              index === 0
                                ? "border-primary/20 bg-primary/5 shadow-sm"
                                : "border-border bg-card/50 hover:bg-card/80"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <h4
                                className={cn(
                                  "text-sm font-medium",
                                  index === 0 ? "text-primary" : ""
                                )}
                              >
                                {step.name}
                              </h4>

                              {step.isRequired && (
                                <Badge className="bg-blue-500/80 text-[10px] px-1.5 py-0">
                                  Bắt buộc
                                </Badge>
                              )}
                            </div>

                            {step.description && (
                              <p className="mt-2 text-xs text-muted-foreground border-l-2 border-muted pl-2">
                                {step.description}
                              </p>
                            )}

                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Thời gian ước tính:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {step.estimatedNumberOfDays} ngày
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50">
                                  <User className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Người phụ trách:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {step.roleOfThePersonInCharge ||
                                      "Chưa xác định"}
                                  </span>
                                </div>
                              </div>

                              {step.isStepWithCost && (
                                <div className="flex items-center gap-2 text-xs sm:col-span-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                                    <Coins className="h-3.5 w-3.5 text-amber-600" />
                                  </div>
                                  <span className="text-amber-600 font-medium">
                                    Bước này có phát sinh chi phí
                                  </span>
                                </div>
                              )}
                            </div>

                            {step.department && (
                              <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-xs">
                                <span className="text-muted-foreground">
                                  Phòng ban phụ trách:
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-background font-normal h-5"
                                >
                                  {step.department.name}
                                </Badge>
                              </div>
                            )}
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
