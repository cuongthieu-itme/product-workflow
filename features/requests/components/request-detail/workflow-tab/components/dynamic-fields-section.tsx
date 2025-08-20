import { Settings } from "lucide-react";
import { FieldType } from "@/features/workflows/types";
import { Control } from "react-hook-form";
import { Fields } from "./fields";
import { SubprocessHistoryType } from "@/features/requests/type";
import { BaseResultQuery } from "@/types/common";

interface DynamicFieldsSectionProps {
  fields?: BaseResultQuery<FieldType[]>;
  control: Control<any>;
  shouldShowField: (field: FieldType) => boolean;
  step: SubprocessHistoryType;
  nearestSampleMedia: string[];
  nearestApprovedSampleImage: string;
  previousStepValues: Record<string, any>;
}

export const DynamicFieldsSection = ({
  fields,
  control,
  shouldShowField,
  step,
  nearestSampleMedia,
  nearestApprovedSampleImage,
  previousStepValues,
}: DynamicFieldsSectionProps) => {
  if (
    !fields?.data ||
    fields.data.length === 0 ||
    step.isApproved ||
    step.status === "COMPLETED"
  ) {
    return null;
  }

  return (
    <div className="p-4 rounded-md border bg-card shadow-sm overflow-visible">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
        <Settings className="text-primary w-5 h-5" />
        Thông tin bổ sung
        {fields?.data?.filter((field) => shouldShowField(field)).length > 0 && (
          <span className="text-sm text-red-600 font-normal">
            (* Tất cả các trường đều bắt buộc để hoàn thành)
          </span>
        )}
      </h3>

      <Fields
        fields={fields || []}
        control={control}
        shouldShowField={shouldShowField}
        isCompleted={step.isApproved}
        values={step.fieldSubprocess || {}}
        nearestSampleMedia={nearestSampleMedia}
        nearestApprovedSampleImage={nearestApprovedSampleImage}
        previousStepValues={previousStepValues}
      />

      {/* Show message if no fields to display */}
      {fields?.data &&
        fields.data.filter((field) => shouldShowField(field)).length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Không có trường nào để hiển thị
          </div>
        )}
    </div>
  );
};
