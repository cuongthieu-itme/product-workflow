import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { RequestStatus, RequestType } from "../../type";
import { useChangeStatusRequestMutation } from "../../hooks/useRequest";
import { useGetWorkflowProcessByIdQuery } from "@/features/workflows/hooks";
import { WorkFlowStepType } from "@/features/workflows/types";
import { ConfirmRequestInputType } from "../../schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useProductsStatusQuery } from "@/features/products-status/hooks";
import { SelectCustom } from "@/components/form";
import { Calendar, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

export const RequestConfirmDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request?: RequestType;
}) => {
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

  const options =
    statusProduct?.data?.map((status) => ({
      value: status.id,
      label: status.name,
    })) ?? [];

  const selectedStatus = statusProduct?.data?.find(
    (option) => option.id == watch("statusProductId")
  );

  const { data: process } = useGetWorkflowProcessByIdQuery(selectedStatus?.id);

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
      description={`Bạn có chắc chắn muốn duyệt yêu cầu "${request?.title}" không?`}
    >
      <ScrollArea className="max-h-[50vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-700">
                <strong>Tên yêu cầu:</strong> {request?.title}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Mô tả:</strong> {request?.description}
              </p>
            </div>

            <SelectCustom
              valueType="number"
              control={control}
              name="statusProductId"
              options={options}
              label="Trạng thái Sản phẩm"
              placeholder="Chọn trạng thái Sản phẩm"
            />

            {process && (
              <div className="max-w-4xl mx-auto bg-white">
                <div className="mb-8 flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Quy trình xử lý
                  </h2>
                  <p className="text-gray-600">
                    Các bước xử lý trong quy trình này sẽ được thực hiện theo
                    thứ tự từ trên xuống dưới.
                  </p>
                </div>

                <div className="relative mt-4">
                  {process.subprocesses.length === 0 && (
                    <p className="text-gray-500 text-center">
                      Không có bước xử lý nào trong quy trình này.
                    </p>
                  )}
                  {process?.subprocesses.map((step, index) => {
                    const isLast = index === process?.subprocesses.length - 1;

                    return (
                      <div
                        key={step.id}
                        className="relative pb-12 last:pb-0 mb-4"
                      >
                        {/* Connector Line */}
                        {!isLast && (
                          <div className="absolute left-6 top-12 w-0.5 h-full bg-blue-200" />
                        )}

                        <div className="flex items-start space-x-4">
                          {/* Step Circle */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-blue-50 border-blue-500 text-blue-600">
                              <span className="text-sm font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {step.name}
                                </h3>
                              </div>

                              <p className="text-sm mb-4 text-gray-600">
                                {step.description}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Thời gian:
                                    </span>{" "}
                                    {step.estimatedNumberOfDays} ngày
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Phụ trách:
                                    </span>{" "}
                                    {step.roleOfThePersonInCharge}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button disabled={isChangeStatusPending}>
                {isChangeStatusPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </form>
      </ScrollArea>
    </BaseDialog>
  );
};
