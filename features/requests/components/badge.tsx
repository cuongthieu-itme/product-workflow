import { Badge } from "@/components/ui/badge";
import { PriorityEnum } from "../constants";
import {
  generatePriorityText,
  generateRequestStatus,
  getRequestStatusColor,
  getStatusText,
} from "../helpers";
import { RequestStatus } from "../type";

export const PriorityBadge = ({ priority }: { priority: PriorityEnum }) => {
  const priorityConfig = {
    [PriorityEnum.VERY_HIGH]: {
      className: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
      icon: "🔥",
    },
    [PriorityEnum.HIGH]: {
      className:
        "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
      icon: "⚡",
    },
    [PriorityEnum.MEDIUM]: {
      className:
        "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
      icon: "⚠️",
    },
    [PriorityEnum.NORMAL]: {
      className:
        "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
      icon: "📋",
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      className={`${config.className} font-medium px-3 py-1 text-xs transition-all duration-200 shadow-sm`}
      variant="outline"
    >
      <span className="mr-1.5 text-xs">{config.icon}</span>
      {generatePriorityText(priority)}
    </Badge>
  );
};

export const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const color = getRequestStatusColor(status);

  return <Badge className={`${color}`}>{generateRequestStatus(status)}</Badge>;
};
