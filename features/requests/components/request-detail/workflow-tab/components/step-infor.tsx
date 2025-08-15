import { getStatusText, getHoldInfo } from "@/features/requests/helpers";
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
  Pause,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { FieldType } from "@/features/workflows/types";
import { BaseResultQuery } from "@/types/common";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useProductsStatusQuery } from "@/features/products-status/hooks";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { useUsersQuery } from "@/features/users/hooks";

interface StepInfoProps {
  step: SubprocessHistoryType;
  userName?: string;
  userAvatar?: string;
  fields?: BaseResultQuery<FieldType[]>;
  shouldShowField?: (field: FieldType) => boolean;
}

export const StepInfo = ({
  step,
  userName,
  userAvatar,
  fields,
  shouldShowField,
}: StepInfoProps) => {
  const holdInfo = getHoldInfo(step);

  // Fetch data for select field mapping
  const { data: users } = useUsersQuery({ limit: 10000 });
  const { data: categories } = useCategoriesQuery({ limit: 10000 });
  const { data: productStatus } = useProductsStatusQuery({ limit: 10000 });
  const { data: materials } = useMaterialsQuery({ page: 1, limit: 10000 });

  // Helper function to get display name for select fields
  const getSelectDisplayValue = (field: FieldType, value: any): string => {
    if (!value) return "Chưa có dữ liệu";

    // Map based on enumValue constants to get the correct display name
    switch (field.enumValue) {
      // User-related fields
      case "APPROVED_BY":
      case "PURCHASER":
      case "CHECKED_BY":
      case "DESIGNER":
      case "SAMPLE_MAKER":
      case "PRODUCT_FEEDBACK_RESPONDER":
      case "SAMPLE_FEEDBACK_RESPONDER":
      case "MATERIAL_CONFIRMER":
      case "WAREHOUSE_CHECKER":
      case "RD_MATERIAL_CHECKER":
      case "ASSIGNED_TO":
      case "TEMPLATE_CHECKER":
      case "MOCKUP_CHECKER":
      case "APPROVED_BY":
      case "DESIGNER":
        const user = users?.data?.find((u) => u.id == value);
        return user ? user.fullName : value.toString();

      // Status fields
      case "STATUS":
      case "SAMPLE_STATUS":
      case "PRODUCT_FEEDBACK_STATUS":
      case "PURCHASE_STATUS":
      case "TEMPLATE_CHECKING_STATUS":
      case "MOCKUP_CHECKING_STATUS":
        const status = productStatus?.data?.find((s) => s.id === value);
        return status ? status.name : value.toString();

      // Material type field
      case "MATERIAL_TYPE":
        const material = materials?.data?.find((m) => m.id === value);
        return material ? material.name : value.toString();

      // Category field
      case "CATEGORY":
        const category = categories?.data?.find((c) => c.id === value);
        return category ? category.name : value.toString();

      // Default - try to parse if it's a JSON string with options
      default:
        if (field.enumValue) {
          try {
            const parsedOptions = JSON.parse(field.enumValue);
            if (Array.isArray(parsedOptions)) {
              const option = parsedOptions.find((opt) => opt.value === value);
              return option ? option.label : value.toString();
            }
          } catch (e) {
            // If not JSON, try to split by comma and find match
            const splitOptions = field.enumValue
              .split(",")
              .map((opt) => opt.trim());
            return splitOptions.includes(value) ? value : value.toString();
          }
        }
        return value.toString();
    }
  };

  // Helper function to format display value for completed fields
  const formatDisplayValue = (field: FieldType, value: any) => {
    if (!value) return "Chưa có dữ liệu";

    // Handle array values
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(", ") || "Chưa có dữ liệu";
    }

    // Handle select/enum fields - show label instead of value
    if (
      field.type.toLowerCase() === "select" ||
      field.type.toLowerCase() === "enum"
    ) {
      return getSelectDisplayValue(field, value);
    }

    // Handle date fields
    if (field.type.toLowerCase() === "date") {
      try {
        return new Date(value).toLocaleDateString("vi-VN");
      } catch {
        return value;
      }
    }

    return value.toString();
  };

  // Get completed fields to display
  const completedFields =
    fields?.data?.filter((field) =>
      shouldShowField ? shouldShowField(field) : true
    ) || [];

  const fieldValues = step.fieldSubprocess || ({} as Record<string, any>);

  const renderStatusIcon = (status: StatusSubprocessHistory) => {
    switch (status) {
      case StatusSubprocessHistory.COMPLETED:
        return <BadgeCheck className="text-green-600 w-5 h-5" />;
      case StatusSubprocessHistory.CANCELLED:
        return <CircleSlash className="text-red-600 w-5 h-5" />;
      case StatusSubprocessHistory.SKIPPED:
        return <Clock className="text-yellow-600 w-5 h-5" />;
      case StatusSubprocessHistory.HOLD:
        return <Pause className="text-orange-600 w-5 h-5" />;
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
                ? format(new Date(step.startDate), "dd/MM/yyyy hh:mm")
                : "Chưa xác định"}{" "}
              →{" "}
              {step.endDate
                ? format(new Date(step.endDate), "dd/MM/yyyy hh:mm  ")
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

        {/* Thông tin Hold History */}
        {(holdInfo.holdCount > 0 || holdInfo.continueCount > 0) && (
          <div className="col-span-full">
            <div className="flex items-center gap-3 mb-2">
              <Pause className="text-orange-600 w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium text-muted-foreground">
                Lịch sử tạm dừng ({holdInfo.holdCount}/{holdInfo.maxHolds} lần
                tạm đừng, {holdInfo.continueCount} lần tiếp tục)
              </p>
            </div>
            <div className="pl-8 space-y-1">
              {step.holdDateOne && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600 font-medium">
                    Tạm dừng lần 1:
                  </span>
                  <span>
                    {format(new Date(step.holdDateOne), "dd/MM/yyyy HH:mm")}
                  </span>
                  {step.continueDateOne && (
                    <span className="text-green-600">
                      → Quay lại:{" "}
                      {format(
                        new Date(step.continueDateOne),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </span>
                  )}
                </div>
              )}
              {step.holdDateTwo && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600 font-medium">Hold 2:</span>
                  <span>
                    {format(new Date(step.holdDateTwo), "dd/MM/yyyy HH:mm")}
                  </span>
                  {step.continueDateTwo && (
                    <span className="text-green-600">
                      → Continue:{" "}
                      {format(
                        new Date(step.continueDateTwo),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </span>
                  )}
                </div>
              )}
              {step.holdDateThree && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600 font-medium">Hold 3:</span>
                  <span>
                    {format(new Date(step.holdDateThree), "dd/MM/yyyy HH:mm")}
                  </span>
                  {step.continueDateThree && (
                    <span className="text-green-600">
                      → Continue:{" "}
                      {format(
                        new Date(step.continueDateThree),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </span>
                  )}
                </div>
              )}
              {/* Hiển thị trạng thái hiện tại */}
              {holdInfo.nextAction !== "none" && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <span className="text-blue-700 font-medium">
                    Hành động tiếp theo:
                    {holdInfo.nextAction === "hold1" &&
                      " Có thể tạm dừng lần 1"}
                    {holdInfo.nextAction === "continue1" &&
                      " Có thể tiếp tục từ hold lần 1"}
                    {holdInfo.nextAction === "hold2" &&
                      " Có thể tạm dừng lần 2"}
                    {holdInfo.nextAction === "continue2" &&
                      " Có thể tiếp tục từ hold lần 2"}
                    {holdInfo.nextAction === "hold3" &&
                      " Có thể tạm dừng lần 3"}
                    {holdInfo.nextAction === "continue3" &&
                      " Có thể tiếp tục từ hold lần 3"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thông tin Fields đã hoàn thành */}
        {(step.isApproved ||
          step.status === StatusSubprocessHistory.COMPLETED) &&
          completedFields.length > 0 && (
            <div className="col-span-full mt-4">
              <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                <Settings className="text-primary w-5 h-5 flex-shrink-0" />
                <p className="text-base font-medium text-gray-800">
                  Thông tin bổ sung đã hoàn thành
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedFields.map((field) => {
                  const fieldValue = (fieldValues as Record<string, any>)[
                    field.value as string
                  ];

                  // Skip empty fields
                  if (
                    !fieldValue &&
                    fieldValue !== 0 &&
                    !Array.isArray(fieldValue)
                  )
                    return null;

                  return (
                    <div key={field.value} className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-700">
                        {field.label}
                      </span>
                      <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md border">
                        {field.valueType === "string_array" &&
                        Array.isArray(fieldValue) ? (
                          fieldValue.filter(Boolean).length > 0 ? (
                            <ul className="space-y-1">
                              {fieldValue
                                .filter(Boolean)
                                .map((item: string, index: number) => (
                                  <li key={index} className="text-sm">
                                    • {item}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 italic">
                              Chưa có dữ liệu
                            </span>
                          )
                        ) : (
                          <span>{formatDisplayValue(field, fieldValue)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
