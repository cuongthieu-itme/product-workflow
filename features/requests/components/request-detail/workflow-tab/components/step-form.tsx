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
import { Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { UserRoleEnum } from "@/features/auth/constants";
import { DatePickerCustom } from "@/components/form/date-picker";
import { Button } from "@/components/ui/button";
import {
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

export const StepEditForm: React.FC<StepEditFormProps> = ({ step }) => {
  const user = step.user;
  const userName = user?.fullName || "Chưa có";
  const userAvatar = user?.avatarUrl || undefined;

  const renderStatusIcon = (status: StatusSubprocessHistory) => {
    switch (status) {
      case StatusSubprocessHistory.COMPLETED:
        return <BadgeCheck className="text-green-600 w-4 h-4 inline" />;
      case StatusSubprocessHistory.CANCELLED:
        return <CircleSlash className="text-red-600 w-4 h-4 inline" />;
      default:
        return <Clock className="text-yellow-600 w-4 h-4 inline" />;
    }
  };

  const StepInfoSection = () => (
    <div className="mb-6 mt-4 p-4 rounded-md border bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <ListChecks className="text-blue-600 w-5 h-5" />
        <span className="font-semibold">Tên bước:</span>{" "}
        {step.name || "Chưa có"}
      </div>
      <div className="flex items-center gap-2">
        <Info className="text-blue-600 w-5 h-5" />
        <span className="font-semibold">Mô tả:</span>{" "}
        {step.description || "Chưa có"}
      </div>
      <div className="flex items-center gap-2">
        {renderStatusIcon(step.status)}
        <span className="font-semibold">Trạng thái:</span> {step.status}
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays className="text-blue-600 w-5 h-5" />
        <span className="font-semibold">Thời gian:</span>
        {step.startDate
          ? new Date(step.startDate).toLocaleDateString()
          : "-"}{" "}
        &rarr;{" "}
        {step.endDate ? new Date(step.endDate).toLocaleDateString() : "-"}
      </div>
      <div className="flex items-center gap-2">
        <UserCircle className="text-blue-600 w-5 h-5" />
        <span className="font-semibold">Người thực hiện:</span>
        {userAvatar && (
          <img
            src={userAvatar}
            alt={userName}
            className="w-6 h-6 rounded-full object-cover inline-block mr-1"
          />
        )}{" "}
        {userName}
      </div>
      {step.isStepWithCost && (
        <div className="flex items-center gap-2">
          <Coins className="text-yellow-600 w-5 h-5" />
          <span className="font-semibold">Chi phí:</span>{" "}
          {step.price ? `${step.price.toLocaleString()} đ` : "Chưa có"}
        </div>
      )}
    </div>
  );
  const { data: usersData } = useUsersQuery({
    departmentId: step.departmentId,
  });
  const users = usersData?.data || [];
  const { data: currentUserData } = useGetUserInfoQuery();
  const isCompleted = step.status === StatusSubprocessHistory.COMPLETED;
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

  const handleSkipStep = () => {
    if (!step.id || !step.isRequired) return;
    skipSubprocessHistory(
      {
        id: step.id,
        status: StatusSubprocessHistory.CANCELLED,
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-6"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePickerCustom
          name="startDate"
          control={control}
          label="Ngày bắt đầu"
        />

        <DatePickerCustom
          name="endDate"
          control={control}
          label="Ngày kết thúc"
        />

        {isAdmin ? (
          <SelectCustom
            label="Người thực hiện"
            name="userId"
            control={control}
            options={users.map((user: any) => ({
              value: user.id,
              label: `${user.fullName} (${user.email})`,
            }))}
            placeholder="Chọn người thực hiện"
          />
        ) : (
          <p className="text-gray-500">{getUserAssignName()}</p>
        )}

        {isStepWithCost && (
          <InputCustom
            name="price"
            control={control}
            type="number"
            min={1}
            step={1000}
            placeholder="Nhập giá"
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        {!step.isRequired && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSkipStep}
            variant="destructive"
          >
            {isSubmitting && !completeMode && (
              <Loader2 className="animate-spin w-4 h-4" />
            )}
            Bỏ qua bước này
          </Button>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setCompleteMode(false)}
          >
            {isSubmitting && !completeMode && (
              <Loader2 className="animate-spin w-4 h-4" />
            )}
            Lưu
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setCompleteMode(true)}
            variant="secondary"
          >
            {isSubmitting && completeMode && (
              <Loader2 className="animate-spin w-4 h-4" />
            )}
            Hoàn thành
          </Button>
        </div>
      </div>
    </form>
  );
};
