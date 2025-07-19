// SelectCustom.tsx
"use client";

import { useState } from "react";
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
}

export const KEY_EMPTY_SELECT = "empty-select-option";

export type SelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  emptyOption?: {
    label: string;
  };
  valueType?: "string" | "number";
  containerClassName?: string;
  searchable?: boolean;
  clearable?: boolean;
  noResultsText?: string;
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
  searchPlaceholder = "Tìm kiếm...",
  required = false,
  disabled = false,
  className = "",
  emptyOption,
  valueType = "string",
  containerClassName = "",
  searchable = false,
  clearable = true,
  noResultsText = "Không tìm thấy kết quả",
}: SelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

  // Prepare options with empty option if provided
  let allOptions = [...options];
  if (emptyOption) {
    allOptions = [
      {
        label: emptyOption.label,
        value: KEY_EMPTY_SELECT,
      },
      ...options,
    ];
  }

  // If searchable, use combobox approach
  if (searchable) {
    // Filter options based on search
    const filteredOptions = allOptions.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Find selected option
    const selectedOption = allOptions.find((option) => {
      if (value === undefined || value === null) {
        return option.value === KEY_EMPTY_SELECT;
      }
      return String(option.value) === String(value);
    });

    const handleSelect = (selectedValue: string) => {
      if (selectedValue === KEY_EMPTY_SELECT) {
        onChange(valueType === "number" ? undefined : "");
      } else {
        onChange(
          valueType === "number" ? Number(selectedValue) : selectedValue
        );
      }
      setOpen(false);
      setSearchValue("");
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(valueType === "number" ? undefined : "");
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <div className="flex items-center">
            <Label htmlFor={name}>{label}</Label>
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
        )}

        <div className="space-y-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                  "w-full justify-between",
                  !selectedOption && "text-muted-foreground",
                  fieldState.error &&
                    "border-red-500 focus-visible:border-red-500",
                  className
                )}
                {...field}
              >
                <span className="truncate">
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-1">
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  {filteredOptions.length === 0 ? (
                    <CommandEmpty>{noResultsText}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => handleSelect(String(option.value))}
                          className="bg-transparent hover:bg-transparent"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedOption?.value === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {fieldState.error && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      </div>
    );
  }

  // Original select behavior for non-searchable
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
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <div className="flex items-center">
          <Label htmlFor={name}>{label}</Label>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      <div className="space-y-1">
        <Select
          value={value === undefined ? KEY_EMPTY_SELECT : String(value)}
          onValueChange={(v) =>
            onChange(valueType === "number" ? Number(v) : v)
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
