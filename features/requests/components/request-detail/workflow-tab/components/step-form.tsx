import { SelectCustom } from "@/components/form";
import { InputCustom } from "@/components/form/input";
import {
  subprocessHistoryFormSchema,
  SubprocessHistoryFormType,
} from "@/features/requests/schema";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
} from "@/features/requests/type";
import { useUsersQuery } from "@/features/users/hooks";
import { useGetUserInfoQuery } from "@/features/auth/hooks/useGetUserInfoQuery";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { UserRoleEnum } from "@/features/auth/constants";
import { DatePickerCustom } from "@/components/form/date-picker";
import { Button } from "@/components/ui/button";
import {
  useAssignUserToStepMutation,
  useSkipSubprocessHistoryMutation,
  useUpdateSubprocessHistoryMutation,
} from "@/features/requests/hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";

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
} from "lucide-react";
import { getStatusText } from "@/features/requests/helpers";
import { format } from "date-fns";
import Image from "next/image";
import { MultiSelectDemo } from "@/components/form/multi-select-demo";

export const StepEditForm: React.FC<StepEditFormProps> = ({ step }) => {
  const user = step.user;
  const userName = user?.fullName || "Chưa có";
  const userAvatar = user?.avatarUrl || undefined;

  const renderStatusIcon = (status: StatusSubprocessHistory) => {
    switch (status) {
      case StatusSubprocessHistory.COMPLETED:
        return <BadgeCheck className="text-green-600 w-5 h-5" />;
      case StatusSubprocessHistory.CANCELLED:
        return <CircleSlash className="text-red-600 w-5 h-5" />;
      case StatusSubprocessHistory.SKIPPED:
        return <Clock className="text-yellow-600 w-5 h-5" />;
      default:
        return <Clock className="text-yellow-600 w-5 h-5" />;
    }
  };

  // Info section dùng cho cả chế độ view và edit
  const StepInfoSection = () => (
    <div className="mb-6 p-4 rounded-md border bg-card shadow-sm">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
        <ListChecks className="text-primary w-5 h-5" />
        {step.name || "Chi tiết bước"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Info className="text-blue-600 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
            <p className="text-sm">{step.description || "Chưa có mô tả"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderStatusIcon(step.status)}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Trạng thái
            </p>
            <p className="text-sm">{getStatusText(step.status)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-600 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Thời gian
            </p>
            <p className="text-sm">
              {step.startDate
                ? format(new Date(step.startDate), "dd/MM/yyyy")
                : "Chưa xác định"}{" "}
              →{" "}
              {step.endDate
                ? format(new Date(step.endDate), "dd/MM/yyyy")
                : "Chưa xác định"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserCircle className="text-blue-600 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Người thực hiện
            </p>
            <div className="flex items-center gap-2">
              {userAvatar && (
                <Image
                  src={userAvatar}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover"
                  width={24}
                  height={24}
                />
              )}
              <p className="text-sm">{userName}</p>
            </div>
          </div>
        </div>

        {step.isStepWithCost && (
          <div className="flex items-center gap-3">
            <Coins className="text-yellow-600 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chi phí
              </p>
              <p className="text-sm">
                {step.price ? `${step.price.toLocaleString()} đ` : "Chưa có"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const { data: usersData } = useUsersQuery({
    departmentId: step.departmentId,
  });
  const users = usersData?.data || [];
  const { data: currentUserData } = useGetUserInfoQuery();
  const isCompleted =
    step.status === StatusSubprocessHistory.COMPLETED ||
    step.status === StatusSubprocessHistory.CANCELLED ||
    step.status === StatusSubprocessHistory.SKIPPED;
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
  } = useForm<SubprocessHistoryFormType>({
    defaultValues: {
      ...step,
      startDate: step.startDate ? new Date(step.startDate) : new Date(),
      endDate: step.endDate ? new Date(step.endDate) : new Date(),
      userId: step.userId || undefined,
      price: step.price ?? undefined,
      isStepWithCost: step.isStepWithCost,
    },
    resolver: zodResolver(subprocessHistoryFormSchema),
  });

  const isStepWithCost = step.isStepWithCost;

  const { mutate: updateSubprocessHistory } =
    useUpdateSubprocessHistoryMutation();

  const { mutate: skipSubprocessHistory } = useSkipSubprocessHistoryMutation();
  const { mutate: assignUserToStep } = useAssignUserToStepMutation();

  const handleAssignUser = () => {
    const userId = watch("userId");
    if (!userId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn người thực hiện trước khi gán!",
        variant: "destructive",
      });
      return;
    }

    assignUserToStep(
      {
        id: step.id,
        userId: Number(userId),
        isRequired: step.isStepWithCost,
        isStepWithCost: step.isStepWithCost,
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Thành công",
            description: `Đã gán ${data.user?.fullName} làm người thực hiện!`,
          });
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Không thể gán người thực hiện!",
            variant: "destructive",
          });
        },
      }
    );
  };

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

  const onSubmit: SubmitHandler<SubprocessHistoryFormType> = (data) => {
    updateSubprocessHistory(
      {
        ...data,
        status: completeMode
          ? StatusSubprocessHistory.COMPLETED
          : StatusSubprocessHistory.IN_PROGRESS,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: completeMode
              ? "Bước đã hoàn thành bước này"
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
      }
    );
    setCompleteMode(false); // reset lại sau submit
  };

  const getUserAssignName = () => {
    const userObj = users.find((u: any) => u.id === step.userId);
    return userObj
      ? `${userObj.fullName} (${userObj.email})`
      : "Chưa gán người thực hiện";
  };

  if (!canEdit) {
    return <StepInfoSection />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
            {isAssignedUser ? (
              <div className="grid grid-cols-1 gap-4">
                <DatePickerCustom
                  name="startDate"
                  control={control}
                  label="Ngày bắt đầu"
                  className="w-full"
                />
                <DatePickerCustom
                  name="endDate"
                  control={control}
                  label="Ngày kết thúc"
                  className="w-full"
                />
              </div>
            ) : (
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
            )}
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
                  <span className="text-sm">{getUserAssignName()}</span>
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
          {isAdmin ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleAssignUser}
              className="flex items-center"
            >
              {isSubmitting && !completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <User className="w-4 h-4 mr-2" />
              )}
              Gán người thực hiện
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setCompleteMode(false)}
              variant="outline"
              className="flex items-center"
            >
              {isSubmitting && !completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              Lưu thông tin
            </Button>
          )}

          {(!isAdmin || isAssignedUser) && (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setCompleteMode(true)}
              variant="default"
              className="bg-green-600 hover:bg-green-700 flex items-center"
            >
              {isSubmitting && completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BadgeCheck className="w-4 h-4 mr-2" />
              )}
              Hoàn thành bước
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
