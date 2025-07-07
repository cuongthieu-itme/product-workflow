import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Textarea as BaseInput } from "@/components/ui/textarea";
import type { TextareaProps as BaseInputProps } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type InputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value"> & {
    label?: string;
    className?: string;
  };

export const TextAreaCustom = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...props
}: InputProps<T>) => {
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
          <Label htmlFor={name}>{label}</Label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-1">
        <BaseInput
          id={name}
          placeholder={placeholder}
          value={value}
          {...field}
          disabled={disabled}
          className={`w-full ${className} ${
            fieldState.error
              ? "border-red-500 placeholder:text-red-500 focus-visible:placeholder:text-red-500 focus-visible:border-red-500"
              : ""
          }`}
          {...props}
        />
        {fieldState.error && (
          <p className="text-sm text-red-500">{fieldState.error.message}</p>
        )}
      </div>
    </div>
  );
};
