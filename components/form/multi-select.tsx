// MultiSelectCustom.tsx
"use client";

import { useState } from "react";
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

export interface MultiSelectOption {
  label: string;
  value: string | number;
}

export type MultiSelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  valueType?: "string" | "number";
  containerClassName?: string;
  clearable?: boolean;
  noResultsText?: string;
  maxDisplayedItems?: number;
  selectAllText?: string;
  clearAllText?: string;
  showSelectAll?: boolean;
  showClearAll?: boolean;
};

export const MultiSelectCustom = <T extends FieldValues>({
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
  valueType = "string",
  containerClassName = "",
  clearable = true,
  noResultsText = "Không tìm thấy kết quả",
  maxDisplayedItems = 3,
  selectAllText = "Chọn tất cả",
  clearAllText = "Bỏ chọn tất cả",
  showSelectAll = true,
  showClearAll = true,
}: MultiSelectProps<T>) => {
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

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Get selected options for display
  const selectedOptions = options.filter((option) =>
    selectedValues.some((val) => String(val) === String(option.value))
  );

  const handleSelect = (optionValue: string | number) => {
    const stringValue = String(optionValue);
    const convertedValue = valueType === "number" ? Number(optionValue) : stringValue;
    
    const isSelected = selectedValues.some((val) => String(val) === stringValue);
    
    let newValues: (string | number)[];
    if (isSelected) {
      // Remove item
      newValues = selectedValues.filter((val) => String(val) !== stringValue);
    } else {
      // Add item
      newValues = [...selectedValues, convertedValue];
    }
    
    onChange(newValues);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      // Clear all
      onChange([]);
    } else {
      // Select all
      const allValues = options.map((option) => 
        valueType === "number" ? Number(option.value) : String(option.value)
      );
      onChange(allValues);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleRemoveItem = (optionValue: string | number) => {
    const stringValue = String(optionValue);
    const newValues = selectedValues.filter((val) => String(val) !== stringValue);
    onChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    
    if (selectedOptions.length <= maxDisplayedItems) {
      return selectedOptions.map((option) => option.label).join(", ");
    }
    
    return `${selectedOptions.slice(0, maxDisplayedItems).map((option) => option.label).join(", ")} (+${selectedOptions.length - maxDisplayedItems} khác)`;
  };

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <div className="flex items-center h-[24px]">
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
                "w-full justify-between min-h-10 h-auto",
                selectedOptions.length === 0 && "text-muted-foreground",
                fieldState.error &&
                  "border-red-500 focus-visible:border-red-500",
                className
              )}
              {...field}
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedOptions.length === 0 ? (
                  <span className="truncate">{placeholder}</span>
                ) : selectedOptions.length <= maxDisplayedItems ? (
                  selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="text-xs"
                    >
                      {option.label}
                      {clearable && !disabled && (
                        <X
                          className="h-3 w-3 ml-1 hover:bg-secondary-foreground/20 rounded-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(option.value);
                          }}
                        />
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="truncate text-sm">
                    {selectedOptions.slice(0, maxDisplayedItems).map((option) => option.label).join(", ")} 
                    <Badge variant="outline" className="ml-1 text-xs">
                      +{selectedOptions.length - maxDisplayedItems}
                    </Badge>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
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
                <CommandGroup>
                  {/* Select All / Clear All buttons */}
                  {(showSelectAll || showClearAll) && filteredOptions.length > 0 && (
                    <>
                      <div className="flex justify-between p-2 border-b">
                        {showSelectAll && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            className="text-xs h-6 px-2"
                          >
                            {selectedValues.length === options.length ? clearAllText : selectAllText}
                          </Button>
                        )}
                        {showClearAll && selectedValues.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-xs h-6 px-2"
                          >
                            {clearAllText}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  
                  {filteredOptions.length === 0 ? (
                    <CommandEmpty>{noResultsText}</CommandEmpty>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = selectedValues.some(
                        (val) => String(val) === String(option.value)
                      );
                      
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => handleSelect(option.value)}
                          className="bg-transparent hover:bg-transparent"
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelect(option.value)}
                            />
                            <span className="flex-1">{option.label}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
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
};
