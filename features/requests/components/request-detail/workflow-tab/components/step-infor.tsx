import { getStatusText } from "@/features/requests/helpers";
import {
  StatusSubprocessHistory,
  SubprocessHistoryType,
} from "@/features/requests/type";
import { format } from "date-fns";
import {
  BadgeCheck,
  CalendarDays,
  CircleSlash,
  Clock,
  Coins,
  Info,
  ListChecks,
  UserCircle,
} from "lucide-react";
import Image from "next/image";

interface StepInfoProps {
  step: SubprocessHistoryType;
  userName?: string;
  userAvatar?: string;
}

export const StepInfo = ({ step, userName, userAvatar }: StepInfoProps) => {
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

  return (
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
                  alt={userName ?? "Người thực hiện"}
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
};
