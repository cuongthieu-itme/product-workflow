import { InputCustom } from "@/components/form/input";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
} from "@/features/requests/type";
import { useGetUserInfoQuery } from "@/features/auth/hooks/useGetUserInfoQuery";
import { Loader2, User, Pause, CheckCircle, Play } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { UserRoleEnum } from "@/features/auth/constants";
import { Button } from "@/components/ui/button";
import {
  useAssignUserToStepMutation,
  useSkipSubprocessHistoryMutation,
  useUpdateSubprocessHistoryMutation,
  useUpdateFieldStepMutation,
} from "@/features/requests/hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

interface StepEditFormProps {
  step: SubprocessHistoryType;
  steps: SubprocessHistoryType[];
  currentUser: any;
}

import {
  ListChecks,
  Info,
  BadgeCheck,
  CircleSlash,
  Clock,
  CalendarDays,
  UserCircle,
  Coins,
  Settings,
} from "lucide-react";
import { getCheckFields, getStatusText } from "@/features/requests/helpers";
import { format } from "date-fns";
import Image from "next/image";
import { useGetFieldStep } from "@/features/workflows/hooks/useWorkFlowProcess";
import { FieldType } from "@/features/workflows/types";
import { Fields } from "./fields";
import { StepInfo } from "./step-infor";

export const StepEditForm: React.FC<StepEditFormProps> = ({ step }) => {
  const user = step.user;
  const userName = user?.fullName || "Chưa có";
  const userAvatar = user?.avatarUrl || undefined;

  const { data: fields } = useGetFieldStep();

  const checkFieldsList = getCheckFields(step);

  // Function để kiểm tra field có nên hiển thị không dựa vào checkFields
  const shouldShowField = (field: FieldType): boolean => {
    // Nếu không có fields data, return false
    if (!fields?.data) return false;

    // Nếu không có checkFields list, hiển thị tất cả
    if (checkFieldsList.length === 0) return true;

    // Kiểm tra enumValue của field có trong checkFields list không
    const isIncluded = checkFieldsList.includes(field.enumValue);

    return isIncluded;
  }; // Tạo dynamic schema dựa trên fields - simplified approach

  const { data: currentUserData } = useGetUserInfoQuery();

  const isCompleted = step?.isApproved;
  const isAdmin =
    currentUserData?.role === UserRoleEnum.ADMIN ||
    currentUserData?.role === UserRoleEnum.SUPER_ADMIN;
  const isAssignedUser = currentUserData?.id === step.userId;
  const canEdit = (isAdmin || isAssignedUser) && !isCompleted;
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      ...step,
      startDate: step.startDate ? new Date(step.startDate) : new Date(),
      endDate: step.endDate ? new Date(step.endDate) : new Date(),
      userId: step.userId || undefined,
      price: step.price ?? undefined,
      isStepWithCost: step.isStepWithCost,
      // Thêm current values từ fieldSubprocess nếu có
      ...(step.fieldSubprocess
        ? {
            materialCode: step.fieldSubprocess.materialCode || "",
            materialName: step.fieldSubprocess.materialName || "",
            requestId: step.fieldSubprocess.requestId || "",
            requestDate: step.fieldSubprocess.requestDate
              ? new Date(step.fieldSubprocess.requestDate)
              : null,
            priority: step.fieldSubprocess.priority || "",
            createdBy: step.fieldSubprocess.createdBy || "",
            requestSource: step.fieldSubprocess.requestSource || "",
            checker: step.fieldSubprocess.checker || "",
            descriptionMaterial: step.fieldSubprocess.descriptionMaterial || "",
            status: step.fieldSubprocess.status || "",
            quantity: step.fieldSubprocess.quantity || 0,
            unit: step.fieldSubprocess.unit || "",
            color: step.fieldSubprocess.color || "",
            materialType: step.fieldSubprocess.materialType || "",
            media: step.fieldSubprocess.media || [],
            purchaseLink: step.fieldSubprocess.purchaseLink || [],
            additionalNote: step.fieldSubprocess.additionalNote || "",
            approvedBy: step.fieldSubprocess.approvedBy || "",
            approvedTime: step.fieldSubprocess.approvedTime
              ? new Date(step.fieldSubprocess.approvedTime)
              : null,
            purchaser: step.fieldSubprocess.purchaser || "",
            purchasingTime: step.fieldSubprocess.purchasingTime
              ? new Date(step.fieldSubprocess.purchasingTime)
              : null,
            trackingLink: step.fieldSubprocess.trackingLink || "",
            receivedQuantity: step.fieldSubprocess.receivedQuantity || 0,
            checkedBy: step.fieldSubprocess.checkedBy || "",
            checkedTime: step.fieldSubprocess.checkedTime
              ? new Date(step.fieldSubprocess.checkedTime)
              : null,
            sampleProductionPlan:
              step.fieldSubprocess.sampleProductionPlan || "",
            designer: step.fieldSubprocess.designer || "",
            startTime: step.fieldSubprocess.startTime
              ? new Date(step.fieldSubprocess.startTime)
              : null,
            completedTime: step.fieldSubprocess.completedTime
              ? new Date(step.fieldSubprocess.completedTime)
              : null,
            productionFileLink: step.fieldSubprocess.productionFileLink || "",
            sampleMaker: step.fieldSubprocess.sampleMaker || "",
            sampleStatus: step.fieldSubprocess.sampleStatus || "",
            sampleMediaLink: step.fieldSubprocess.sampleMediaLink || [],
            note: step.fieldSubprocess.note || "",
            finalApprovedSampleImage:
              step.fieldSubprocess.finalApprovedSampleImage || "",
            finalProductVideo: step.fieldSubprocess.finalProductVideo || "",
            // ... có thể thêm các fields khác nếu cần
          }
        : {}),
      // Thêm default values cho dynamic fields nếu có
      ...(fields?.data?.reduce((acc, field) => {
        if (shouldShowField(field)) {
          // Chỉ set default nếu chưa có value từ fieldSubprocess
          if (!(field.value in (step.fieldSubprocess || {}))) {
            switch (field.type.toLowerCase()) {
              case "number":
                acc[field.value] = 0;
                break;
              case "date":
                acc[field.value] = new Date();
                break;
              case "file":
                // Không set default value cho file input
                break;
              case "string_array":
                // Khởi tạo array với một string rỗng (bắt buộc)
                acc[field.value] = [""];
                break;
              default:
                // Kiểm tra nếu field type chứa "array"
                if (field.type.toLowerCase().includes("array")) {
                  acc[field.value] = [""];
                } else {
                  acc[field.value] = "";
                }
                break;
            }
          }
        }
        return acc;
      }, {} as Record<string, any>) || {}),
    },

    mode: "onChange",
  });

  const isStepWithCost = step.isStepWithCost;

  const { mutate: updateSubprocessHistory } =
    useUpdateSubprocessHistoryMutation();

  const { mutate: skipSubprocessHistory } = useSkipSubprocessHistoryMutation();
  // const { mutate: assignUserToStep } = useAssignUserToStepMutation();
  const { mutate: updateFieldStep } = useUpdateFieldStepMutation();

  const handleSkipStep = () => {
    if (!step.id || step.isRequired) return;
    skipSubprocessHistory(
      {
        id: step.id,
        status: StatusSubprocessHistory.SKIPPED,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Bước này đã được bỏ qua!",
          });
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Không thể bỏ qua bước này!",
            variant: "destructive",
          });
        },
      }
    );
  };
  const [completeMode, setCompleteMode] = useState(false);
  const [holdMode, setHoldMode] = useState(false);

  const hasStartTime = step?.startDate;

  const onSubmit: SubmitHandler<any> = (data) => {
    const status = completeMode
      ? StatusSubprocessHistory.COMPLETED
      : holdMode
      ? StatusSubprocessHistory.IN_PROGRESS // Hoặc có thể là status HOLD nếu có
      : StatusSubprocessHistory.IN_PROGRESS;

    // Lọc chỉ lấy các field cần thiết cho API
    const submitData = {
      id: data.id,
      startDate: data.startDate,
      endDate: data.endDate,
      userId: data.userId,
      price: data.price,
      isStepWithCost: data.isStepWithCost,
      status: status,
    };

    const fieldsSub = // Thêm fieldSubprocess data nếu có
      fields?.data
        ? Object.keys(data).reduce((acc, key) => {
            // Chỉ include các field từ fields.data (dynamic fields)
            if (fields.data.some((field) => field.value === key)) {
              acc[key] = data[key];
            }
            return acc;
          }, {} as Record<string, any>)
        : undefined;

    // Luôn kiểm tra và cập nhật fieldSubprocess nếu có dữ liệu
    if (
      fieldsSub &&
      Object.keys(fieldsSub).length > 0 &&
      step.fieldSubprocess?.id
    ) {
      updateFieldStep(
        {
          id: step.fieldSubprocess.id,
          ...fieldsSub,
        },
        {
          onSuccess: () => {
            // Sau khi update field step thành công, update subprocess history
            updateSubprocessHistory(submitData, {
              onSuccess: () => {
                toast({
                  title: "Thành công",
                  description: completeMode
                    ? "Bước đã hoàn thành và dữ liệu đã được lưu"
                    : holdMode
                    ? "Bước đã được tạm dừng và dữ liệu đã được lưu"
                    : "Dữ liệu đã được lưu thành công",
                });
              },
              onError: () => {
                toast({
                  title: "Thất bại",
                  description: "Có lỗi xảy ra khi cập nhật trạng thái bước",
                  variant: "destructive",
                });
              },
            });
          },
          onError: () => {
            toast({
              title: "Thất bại",
              description: "Có lỗi xảy ra khi lưu dữ liệu bước",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Nếu không có dynamic fields, chỉ update subprocess history
      updateSubprocessHistory(submitData, {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: completeMode
              ? "Bước đã hoàn thành"
              : holdMode
              ? "Bước đã được tạm dừng"
              : "Bước đã được cập nhật thành công",
          });
        },
        onError: () => {
          toast({
            title: "Thất bại",
            description: "Có lỗi xảy ra khi cập nhật bước",
            variant: "destructive",
          });
        },
      });
    }

    setCompleteMode(false); // reset lại sau submit
    setHoldMode(false); // reset lại sau submit
  };

  // Handle start time button click
  const handleStartTime = () => {
    if (!step.userId) {
      toast({
        title: "Lỗi",
        description: "Chưa có người thực hiện được gán cho bước này!",
        variant: "destructive",
      });
      return;
    }

    const currentTime = new Date();
    const currentFormData = watch();

    // Chuẩn bị data cho updateSubprocessHistory
    const submitData = {
      id: currentFormData.id,
      startDate: currentTime,
      endDate: currentFormData.endDate,
      userId: step.userId,
      price: currentFormData.price,
      isStepWithCost: currentFormData.isStepWithCost,
      status: StatusSubprocessHistory.IN_PROGRESS,
    };

    updateSubprocessHistory(submitData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã bắt đầu công việc!",
        });
      },
      onError: () => {
        toast({
          title: "Thất bại",
          description: "Có lỗi xảy ra khi cập nhật trạng thái bước",
          variant: "destructive",
        });
      },
    });
  };

  if (!canEdit) {
    return (
      <div key={step.id} className="overflow-visible">
        <StepInfo step={step} userName={userName} userAvatar={userAvatar} />
      </div>
    );
  }

  return (
    <form
      key={step.id} // Force re-render when step changes
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 mt-2 overflow-visible"
      noValidate
    >
      <div className="p-4 rounded-md border bg-card shadow-sm">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
          <CalendarDays className="text-primary w-5 h-5" />
          Thông tin bước thực hiện
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dates Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Thời gian thực hiện
            </h4>

            <div className="p-4 rounded-md border bg-muted space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-blue-600 w-5 h-5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Ngày bắt đầu:
                  </span>{" "}
                  <span className="text-sm">
                    {step.startDate
                      ? format(new Date(step.startDate), "dd/MM/yyyy")
                      : "Chưa xác định"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-blue-600 w-5 h-5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Ngày kết thúc:
                  </span>{" "}
                  <span className="text-sm">
                    {step.endDate
                      ? format(new Date(step.endDate), "dd/MM/yyyy")
                      : "Chưa xác định"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Người thực hiện
            </h4>

            <div className="p-4 rounded-md border bg-muted">
              <div className="flex items-center gap-2">
                <User className="text-blue-600 w-5 h-5" />
                <div>
                  <span className="text-sm">
                    {user?.fullName || "Chưa có người thực hiện"} (
                    {user?.email || "Chưa có email"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Section - Only if applicable */}
          {isStepWithCost && (
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Thông tin chi phí
              </h4>
              {isAssignedUser ? (
                <InputCustom
                  name="price"
                  control={control}
                  label="Chi phí thực hiện"
                  type="number"
                  min={1}
                  step={1000}
                  placeholder="Nhập chi phí"
                  className="w-full"
                  labelIcon={<Coins className="text-yellow-600 w-4 h-4" />}
                />
              ) : (
                <div className="p-4 rounded-md border bg-muted">
                  <div className="flex items-center gap-2">
                    <Coins className="text-yellow-600 w-5 h-5" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Chi phí:
                    </span>{" "}
                    <span className="text-sm">
                      {step.price
                        ? `${step.price.toLocaleString()} đ`
                        : "Chưa có"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Fields Section */}
      {fields?.data && fields.data.length > 0 && (
        <div className="p-4 rounded-md border bg-card shadow-sm overflow-visible">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
            <Settings className="text-primary w-5 h-5" />
            Thông tin bổ sung
            {/* Debug info */}
            <span className="text-xs text-gray-500 ml-2">
              (Có {checkFieldsList.length} fields cần hiển thị - isAssignedUser:{" "}
              {isAssignedUser ? "true" : "false"})
            </span>
          </h3>

          {/* Debug: Show available fields and checkFields */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <div>
                <strong>Available Fields:</strong>{" "}
                {fields.data.map((f) => f.value).join(", ")}
              </div>
              <div>
                <strong>Check Fields:</strong> {checkFieldsList.join(", ")}
              </div>
              <div>
                <strong>Filtered Fields:</strong>{" "}
                {fields.data
                  .filter((field) => shouldShowField(field))
                  .map((f) => f.value)
                  .join(", ")}
              </div>
              <div>
                <strong>Current User ID:</strong> {currentUserData?.id},{" "}
                <strong>Step User ID:</strong> {step.userId}
              </div>
              <div>
                <strong>Is Admin:</strong> {isAdmin ? "true" : "false"},{" "}
                <strong>Is Assigned:</strong>{" "}
                {isAssignedUser ? "true" : "false"}
              </div>
            </div>
          )}

          <Fields
            fields={fields ?? []}
            control={control}
            shouldShowField={shouldShowField}
          />

          {/* Show message if no fields to display */}
          {fields.data.filter((field) => shouldShowField(field)).length ===
            0 && (
            <div className="text-center text-gray-500 py-4">
              Không có trường nào để hiển thị
            </div>
          )}
        </div>
      )}

      <div className="mt-6 border-t pt-4 flex justify-between items-center">
        <div className="space-x-2">
          {!step.isRequired && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSkipStep}
              variant="outline"
              className="border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              {isSubmitting && !completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CircleSlash className="w-4 h-4 mr-2 text-red-500" />
              )}
              Bỏ qua
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {/* Button Start Time - chỉ hiển thị nếu chưa có startTime */}
          {!hasStartTime && (isAdmin || isAssignedUser) && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleStartTime}
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Bắt đầu
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              setCompleteMode(false);
              setHoldMode(false);
            }}
            variant="outline"
            className="flex items-center"
          >
            {isSubmitting && !completeMode && !holdMode ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Lưu thông tin
          </Button>

          {/* Button Hold */}
          {(isAdmin || isAssignedUser || hasStartTime) && (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                setHoldMode(true);
                setCompleteMode(false);
              }}
              variant="secondary"
              className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
            >
              {isSubmitting && holdMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              Tạm dừng
            </Button>
          )}

          {/* Button Hoàn thành */}
          {(isAdmin || isAssignedUser) && (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                setCompleteMode(true);
                setHoldMode(false);
              }}
              variant="default"
              className="bg-green-600 hover:bg-green-700 flex items-center"
            >
              {isSubmitting && completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Hoàn thành
            </Button>
          )}

          {isAdmin && (
            <Button
              disabled={isSubmitting}
              variant="default"
              className="bg-green-600 hover:bg-green-700 flex items-center"
            >
              {isSubmitting && completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Phê duyệt
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
