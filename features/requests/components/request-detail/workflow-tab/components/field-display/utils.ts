import { FieldType } from "@/features/workflows/types";

export const getDisplayValue = (
  field: FieldType,
  value: any,
  getOptionsForField: (field: FieldType) => any[]
): string => {
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

export const isVideoUrl = (url: string): boolean =>
  typeof url === "string" && /\.(mp4|webm|mov|m4v)$/i.test(url);
