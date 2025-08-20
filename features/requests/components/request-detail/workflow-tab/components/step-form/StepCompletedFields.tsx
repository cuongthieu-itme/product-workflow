import { BadgeCheck } from "lucide-react";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
} from "@/features/requests/type";
import { FieldType } from "@/features/workflows/types";

interface StepCompletedFieldsProps {
  step: SubprocessHistoryType;
  fields?: { data: FieldType[] };
  shouldShowField: (field: FieldType) => boolean;
  getOptionsForField: (
    field: FieldType
  ) => Array<{ label: string; value: any }>;
}

export const StepCompletedFields: React.FC<StepCompletedFieldsProps> = ({
  step,
  fields,
  shouldShowField,
  getOptionsForField,
}) => {
  // Only show if step is approved or completed and has field data
  if (
    !(step.isApproved || step.status === StatusSubprocessHistory.COMPLETED) ||
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
      // Try to get the actual label from the options
      const options = getOptionsForField(field);
      const selectedOption = options.find((opt) => opt.value == value);
      return selectedOption ? selectedOption.label : value.toString();
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

  const fieldsToShow = fields?.data?.filter(
    (field) =>
      shouldShowField(field) &&
      (step.fieldSubprocess as any)?.[field.value as string]
  );

  if (!fieldsToShow?.length) return null;

  return (
    <div className="p-4 rounded-md border bg-green-50 shadow-sm">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-green-200 flex items-center gap-2">
        <BadgeCheck className="text-green-600 w-5 h-5" />
        Thông tin bổ sung đã hoàn thành
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldsToShow.map((field) => {
          const fieldValue = (step.fieldSubprocess as any)?.[
            field.value as string
          ];

          return (
            <div key={field.value} className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-green-800">
                {field.label}
              </span>
              <div className="text-sm text-green-700 bg-white p-3 rounded-md border border-green-200">
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
