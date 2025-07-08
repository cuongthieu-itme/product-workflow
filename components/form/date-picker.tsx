import { cn } from "@/lib/utils";
import { DatePicker } from "../ui/date-picker";

import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";

export type DatePickerProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export const DatePickerCustom = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  required = false,
  disabled = false,
  className = "",
  ...props
}: DatePickerProps<T>) => {
  const {
    field: { value, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-1">
        <DatePicker
          date={value}
          setDate={field.onChange}
          className={cn(
            "w-full",
            disabled && "opacity-50 cursor-not-allowed",
            fieldState.error && "border-red-500"
          )}
        />
        {fieldState.error && (
          <p className="text-sm text-red-500">{fieldState.error.message}</p>
        )}
      </div>
    </div>
  );
};
