import React, { useState } from "react";
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Input as BaseInput } from "@/components/ui/input";
import type { InputProps as BaseInputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactElement } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type InputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value"> & {
    label?: string;
    className?: string;
    labelIcon?: ReactElement;
    containerClassName?: string;
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
  containerClassName = "",
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

  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && !showPassword ? "password" : "text";

  return (
    <div className={cn("space-y-2", containerClassName)}>
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
        <div className="relative">
          <BaseInput
            id={name}
            type={inputType}
            placeholder={placeholder}
            value={value}
            {...field}
            disabled={disabled}
            className={cn(
              `w-full ${className} ${
                fieldState.error
                  ? "border-red-500 placeholder:text-red-500 focus-visible:placeholder:text-red-500 focus-visible:border-red-500"
                  : ""
              }`
            )}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {fieldState.error && (
          <p className="text-sm text-red-500">{fieldState.error.message}</p>
        )}
      </div>
    </div>
  );
};
