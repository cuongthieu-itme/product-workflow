import { FieldType } from "@/features/workflows/types";
import { getDisplayValue } from "./utils";

interface TextFieldDisplayProps {
  field: FieldType;
  fieldValue: any;
  getOptionsForField: (field: FieldType) => any[];
}

export const TextFieldDisplay = ({
  field,
  fieldValue,
  getOptionsForField,
}: TextFieldDisplayProps) => {
  return <span>{getDisplayValue(field, fieldValue, getOptionsForField)}</span>;
};
