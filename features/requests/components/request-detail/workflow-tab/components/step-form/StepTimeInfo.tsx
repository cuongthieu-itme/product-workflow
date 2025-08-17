import { CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";
import { SubprocessHistoryType } from "@/features/requests/type";

interface StepTimeInfoProps {
  step: SubprocessHistoryType;
}

export const StepTimeInfo: React.FC<StepTimeInfoProps> = ({ step }) => {
  return (
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
                ? format(new Date(step.startDate), "dd/MM/yyyy hh:mm")
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
                ? format(new Date(step.endDate), "dd/MM/yyyy hh:mm")
                : "Chưa xác định"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
