import { BadgeCheck } from "lucide-react";
import { FieldType } from "@/features/workflows/types";
import { SubprocessHistoryType } from "@/features/requests/type";
import { FieldRenderer } from "./field-display/field-renderer";

interface CompletedFieldsDisplayProps {
  step: SubprocessHistoryType;
  fields?: {
    data?: FieldType[];
  };
  shouldShowField: (field: FieldType) => boolean;
  getOptionsForField: (field: FieldType) => any[];
  previousStepValues: Record<string, any>;
}

export const CompletedFieldsDisplay = ({
  step,
  fields,
  shouldShowField,
  getOptionsForField,
  previousStepValues,
}: CompletedFieldsDisplayProps) => {
  if (
    !(step.isApproved || step.status === "COMPLETED") ||
    !step.fieldSubprocess ||
    Object.keys(step.fieldSubprocess).length === 0
  ) {
    return null;
  }

  console.log(
    "Completed Fields Display",
    fields?.data?.filter((field) => shouldShowField(field))
  );

  return (
    <div className="p-4 rounded-md border bg-green-50 shadow-sm">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-green-200 flex items-center gap-2">
        <BadgeCheck className="text-green-600 w-5 h-5" />
        Thông tin bổ sung đã hoàn thành
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
                  <FieldRenderer
                    field={field}
                    fieldValue={fieldValue}
                    previousStepValues={previousStepValues}
                    getOptionsForField={getOptionsForField}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
