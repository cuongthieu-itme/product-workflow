import { Settings } from "lucide-react";
import { Control } from "react-hook-form";
import { FieldType } from "@/features/workflows/types";
import { Fields } from "../fields";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
} from "@/features/requests/type";

interface StepDynamicFieldsProps {
  step: SubprocessHistoryType;
  fields?: { data: FieldType[] };
  control: Control<any>;
  shouldShowField: (field: FieldType) => boolean;
}

export const StepDynamicFields: React.FC<StepDynamicFieldsProps> = ({
  step,
  fields,
  control,
  shouldShowField,
}) => {
  // Don't show if step is completed/approved or no fields
  if (
    !fields?.data ||
    fields.data.length === 0 ||
    step.isApproved ||
    step.status === StatusSubprocessHistory.COMPLETED
  ) {
    return null;
  }

  const fieldsToShow = fields.data.filter((field) => shouldShowField(field));

  return (
    <div className="p-4 rounded-md border bg-card shadow-sm overflow-visible">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
        <Settings className="text-primary w-5 h-5" />
        Thông tin bổ sung
      </h3>

      {fieldsToShow.length > 0 ? (
        <Fields
          fields={fields}
          control={control}
          shouldShowField={shouldShowField}
          isCompleted={true}
          values={step.fieldSubprocess || {}}
        />
      ) : (
        <div className="text-center text-gray-500 py-4">
          Không có trường nào để hiển thị
        </div>
      )}
    </div>
  );
};
