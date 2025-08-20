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
    prefix?: string;
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
  prefix,
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
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (prefix) {
      // Luôn đảm bảo prefix ở đầu và không bị xóa
      if (raw.startsWith(prefix)) {
        // Lưu nguyên giá trị có prefix vào form
        field.onChange(raw);
      } else {
        // Nếu không có prefix hoặc bị xóa, khôi phục lại
        const userInput = raw.replace(
          new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}?`),
          ""
        );
        const valueWithPrefix = prefix + userInput;
        field.onChange(valueWithPrefix);

        // Khôi phục prefix trong DOM
        setTimeout(() => {
          e.target.value = valueWithPrefix;
          e.target.setSelectionRange(
            prefix.length + userInput.length,
            prefix.length + userInput.length
          );
        }, 0);
      }
    } else if (type === "number") {
      field.onChange(raw === "" ? "" : Number(raw));
    } else {
      field.onChange(e);
    }
  };

  const displayValue = prefix
    ? value && typeof value === "string"
      ? value
      : prefix
    : value ?? "";

  const handleCaretPosition = (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (prefix) {
      const input = e.currentTarget;
      requestAnimationFrame(() => {
        // Nếu con trỏ nằm trong prefix thì ép nó ra sau prefix
        if (
          input.selectionStart !== null &&
          input.selectionStart < prefix.length
        ) {
          input.setSelectionRange(prefix.length, prefix.length);
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (prefix) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const input = e.currentTarget;
      const start = Math.max(input.selectionStart || 0, prefix.length);
      const end = Math.max(input.selectionEnd || 0, prefix.length);

      // Lấy giá trị hiện tại
      const currentValue = value && typeof value === "string" ? value : prefix;

      const beforeSelection = currentValue.slice(0, start);
      const afterSelection = currentValue.slice(end);
      const newValue = beforeSelection + pastedText + afterSelection;

      field.onChange(newValue);

      setTimeout(() => {
        const newCursorPosition = beforeSelection.length + pastedText.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };
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
            value={displayValue}
            {...field}
            onChange={handleChange}
            disabled={disabled}
            onFocus={handleCaretPosition}
            onClick={handleCaretPosition}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (prefix) {
                const input = e.currentTarget;
                const cursorPosition = input.selectionStart || 0;

                // Ngăn xóa prefix bằng Backspace hoặc Delete
                if (
                  (e.key === "Backspace" && cursorPosition <= prefix.length) ||
                  (e.key === "Delete" && cursorPosition < prefix.length)
                ) {
                  e.preventDefault();
                  return;
                }

                // Ngăn di chuyển cursor vào vùng prefix bằng phím mũi tên
                if (e.key === "ArrowLeft" && cursorPosition <= prefix.length) {
                  e.preventDefault();
                  input.setSelectionRange(prefix.length, prefix.length);
                  return;
                }

                // Ngăn chọn text trong vùng prefix
                if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                  e.preventDefault();
                  input.setSelectionRange(prefix.length, input.value.length);
                  return;
                }

                // Ngăn Home key di chuyển về đầu hoàn toàn
                if (e.key === "Home") {
                  e.preventDefault();
                  input.setSelectionRange(prefix.length, prefix.length);
                  return;
                }
              }
            }}
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
