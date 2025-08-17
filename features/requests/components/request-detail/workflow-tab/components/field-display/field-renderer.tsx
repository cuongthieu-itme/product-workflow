import { FieldType } from "@/features/workflows/types";
import { MediaFieldDisplay } from "./media-field-display";
import { ImageFieldDisplay } from "./image-field-display";
import { VideoFieldDisplay } from "./video-field-display";
import { ArrayFieldDisplay } from "./array-field-display";
import { TextFieldDisplay } from "./text-field-display";

interface FieldRendererProps {
  field: FieldType;
  fieldValue: any;
  previousStepValues: Record<string, any>;
  getOptionsForField: (field: FieldType) => any[];
}

export const FieldRenderer = ({
  field,
  fieldValue,
  previousStepValues,
  getOptionsForField,
}: FieldRendererProps) => {
  // SAMPLE_MEDIA_LINK: array of media urls
  if (field.enumValue === "SAMPLE_MEDIA_LINK" && Array.isArray(fieldValue)) {
    return <MediaFieldDisplay fieldValue={fieldValue} />;
  }

  // FINAL_APPROVED_SAMPLE_IMAGE: single image
  if (field.enumValue === "FINAL_APPROVED_SAMPLE_IMAGE") {
    return (
      <ImageFieldDisplay
        fieldValue={fieldValue}
        previousStepValue={previousStepValues?.[field.value as string]}
        altText="final-approved-sample"
      />
    );
  }

  // FINAL_PRODUCT_VIDEO: single video
  if (field.enumValue === "FINAL_PRODUCT_VIDEO") {
    return (
      <VideoFieldDisplay
        fieldValue={fieldValue}
        previousStepValue={previousStepValues?.[field.value as string]}
      />
    );
  }

  // String array fields
  if (field.valueType === "string_array" && Array.isArray(fieldValue)) {
    return <ArrayFieldDisplay fieldValue={fieldValue} />;
  }

  // Default text display
  return (
    <TextFieldDisplay
      field={field}
      fieldValue={fieldValue}
      getOptionsForField={getOptionsForField}
    />
  );
};
