import { BadgeCheck } from "lucide-react";
import { getImageUrl } from "@/features/settings/utils";
import { FieldType } from "@/features/workflows/types";
import { SubprocessHistoryType } from "@/features/requests/type";

interface CompletedFieldsDisplayProps {
  step: SubprocessHistoryType;
  fields?: {
    data?: FieldType[];
  };
  shouldShowField: (field: FieldType) => boolean;
  getOptionsForField: (field: FieldType) => any[];
}

export const CompletedFieldsDisplay = ({
  step,
  fields,
  shouldShowField,
  getOptionsForField,
}: CompletedFieldsDisplayProps) => {
  if (
    !(step.isApproved || step.status === "COMPLETED") ||
    !step.fieldSubprocess ||
    Object.keys(step.fieldSubprocess).length === 0
  ) {
    return null;
  }

  // Helper function to get display value for select fields
  const getDisplayValue = (field: FieldType, value: any): string => {
    if (!value && value !== 0) return "Chưa có dữ liệu";

    // Handle select/enum fields
    if (
      field.type.toLowerCase() === "select" ||
      field.type.toLowerCase() === "enum"
    ) {
      // Special cases for specific enum values
      switch (field.enumValue) {
        case "MATERIAL_SENT_TO_RD":
          const materialSentOptions = [
            { label: "Có", value: "yes" },
            { label: "Không", value: "no" },
          ];
          const selectedMaterialSent = materialSentOptions.find(
            (opt) => opt.value === value
          );
          return selectedMaterialSent
            ? selectedMaterialSent.label
            : value.toString();

        case "SAMPLE_STATUS":
          const sampleStatusOptions = [
            { label: "Chờ xử lý", value: "pending" },
            { label: "Đang thực hiện", value: "in_progress" },
            { label: "Hoàn thành", value: "completed" },
            { label: "Thất bại", value: "failed" },
          ];
          const selectedSampleStatus = sampleStatusOptions.find(
            (opt) => opt.value === value
          );
          return selectedSampleStatus
            ? selectedSampleStatus.label
            : value.toString();

        default:
          // Try to get options from the provided getOptionsForField function
          const options = getOptionsForField(field);
          const selectedOption = options.find((opt) => opt.value == value);
          if (selectedOption) {
            return selectedOption.label;
          }

          // Try to parse enumValue if it's a JSON string
          if (field.enumValue) {
            try {
              const parsedOptions = JSON.parse(field.enumValue);
              if (Array.isArray(parsedOptions)) {
                const option = parsedOptions.find((opt) => opt.value === value);
                if (option) {
                  return option.label;
                }
              }
            } catch (e) {
              // If not JSON, try to split by comma
              const splitOptions = field.enumValue.split(",");
              const matchedOption = splitOptions.find(
                (opt) => opt.trim() === value
              );
              if (matchedOption) {
                return matchedOption;
              }
            }
          }

          // Fallback to default status options if field name contains "status"
          if (field.value?.toLowerCase().includes("status")) {
            const defaultStatusOptions = [
              { label: "Chờ xử lý", value: "pending" },
              { label: "Đang xử lý", value: "processing" },
              { label: "Hoàn thành", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
            ];
            const selectedStatus = defaultStatusOptions.find(
              (opt) => opt.value === value
            );
            if (selectedStatus) {
              return selectedStatus.label;
            }
          }

          return value.toString();
      }
    }

    // Handle date fields
    if (field.type.toLowerCase() === "date") {
      try {
        return new Date(value).toLocaleDateString("vi-VN");
      } catch {
        return value.toString();
      }
    }

    return value.toString();
  };

  console.log(
    "Completed Fields Display",
    fields?.data?.filter((field) => shouldShowField(field))
  );

  const isVideoUrl = (url: string) =>
    typeof url === "string" && /\.(mp4|webm|mov|m4v)$/i.test(url);

  return (
    <div className="p-4 rounded-md border bg-green-50 shadow-sm">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-green-200 flex items-center gap-2">
        <BadgeCheck className="text-green-600 w-5 h-5" />
        Thông tin bổ sung đã hoàn thànhsasasa
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields?.data
          ?.filter((field) => shouldShowField(field))
          .map((field) => {
            const fieldValue = (step.fieldSubprocess as any)?.[
              field.value as string
            ];

            return (
              <div key={field.value} className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-green-800">
                  {field.label}
                </span>
                <div className="text-sm text-green-700 bg-white p-3 rounded-md border border-green-200">
                  {/* SAMPLE_MEDIA_LINK: array of media urls */}
                  {field.enumValue === "FINAL_PRODUCT_VIDEO" && (
                    <div className="relative w-full">
                      <video
                        src={getImageUrl(fieldValue)}
                        controls
                        className="w-full rounded-md border"
                      />
                    </div>
                  )}

                  {field.enumValue === "SAMPLE_MEDIA_LINK" &&
                  Array.isArray(fieldValue) ? (
                    fieldValue.filter(Boolean).length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {fieldValue
                          .filter(Boolean)
                          .map((url: string, idx: number) => (
                            <div key={idx} className="relative w-full">
                              {isVideoUrl(url) ? (
                                <video
                                  src={getImageUrl(url)}
                                  controls
                                  className="w-full rounded-md border"
                                />
                              ) : (
                                <img
                                  src={getImageUrl(url)}
                                  alt={`media-${idx}`}
                                  className="w-full rounded-md border object-cover"
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">
                        Chưa có dữ liệu
                      </span>
                    )
                  ) : field.enumValue === "FINAL_APPROVED_SAMPLE_IMAGE" ? (
                    typeof fieldValue === "string" && fieldValue ? (
                      <div className="relative w-full">
                        <img
                          src={getImageUrl(fieldValue)}
                          alt="final-approved-sample"
                          className="w-full h-48 rounded-md border object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">
                        Chưa có hình ảnh
                      </span>
                    )
                  ) : field.enumValue === "FINAL_PRODUCT_VIDEO" &&
                    typeof fieldValue === "string" &&
                    fieldValue ? (
                    <div className="relative w-full">
                      <video
                        src={fieldValue}
                        controls
                        className="w-full rounded-md border"
                      />
                    </div>
                  ) : field.valueType === "string_array" &&
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
                    <span>{getDisplayValue(field, fieldValue)}</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
