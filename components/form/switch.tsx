import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

export type SwitchProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  disabled?: boolean;
};

export const SwitchCustom = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  disabled = false,
  className = "",
  containerClassName = "",
  required = false,
}: SwitchProps<T>) => {
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
    <div className={cn("flex items-center gap-2 flex-col", containerClassName)}>
      <div className="flex flex-row items-center gap-2">
        {label && (
          <div className="flex items-center">
            <Label htmlFor={name}>{label}</Label>
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
        )}
        <Switch
          id={name}
          checked={value}
          onCheckedChange={(checked) => {
            field.onChange(checked);
          }}
          disabled={disabled}
          className={className}
        />
      </div>

      {fieldState.error && (
        <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
      )}
    </div>
  );
};
