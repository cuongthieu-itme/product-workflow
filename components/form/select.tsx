// SelectCustom.tsx
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface SelectOption {
  label: string;
  value: string | number;
}

export const KEY_EMPTY_SELECT = "empty-select-option";

export type SelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  emptyOption?: {
    label: string;
  };
};

export const SelectCustom = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  options,
  placeholder = "Chọn giá trị",
  required = false,
  disabled = false,
  className = "",
  emptyOption,
}: SelectProps<T>) => {
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  // Nếu có tùy chọn rỗng, thêm vào đầu danh sách
  if (emptyOption) {
    options = [
      {
        label: emptyOption.label,
        value: KEY_EMPTY_SELECT,
      },
      ...options,
    ];
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center">
          <Label htmlFor={name}>{label}</Label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      <div className="space-y-1">
        <Select
          value={String(value)}
          onValueChange={(v) =>
            onChange(typeof value === "number" ? Number(v) : v)
          }
          disabled={disabled}
          {...field}
        >
          <SelectTrigger
            id={name}
            className={`${className} ${
              fieldState.error
                ? "border-red-500 placeholder:text-red-500 focus-visible:border-red-500"
                : ""
            } `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {fieldState.error && (
          <p className="text-sm text-red-500">{fieldState.error.message}</p>
        )}
      </div>
    </div>
  );
};
