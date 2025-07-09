import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Input as BaseInput } from "@/components/ui/input";
import type { InputProps as BaseInputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactElement } from "react";

export type InputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value"> & {
    label?: string;
    className?: string;
    labelIcon?: ReactElement;
  };

export const InputCustom = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  labelIcon,
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
        <div className="flex items-center h-[24px]">
          <Label htmlFor={name} className="flex items-center gap-2">
            {labelIcon}

            {label}
          </Label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-1">
        <BaseInput
          id={name}
          type={type}
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
