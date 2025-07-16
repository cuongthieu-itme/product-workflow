import { useState } from "react";
import {
  type FieldValues,
  type Path,
  type Control,
  useController,
} from "react-hook-form";
import { predefinedColors } from "../constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // hàm gộp class

interface ChooseColorProductStatusProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: string;
  shouldUnregister?: boolean;
}

export function ChooseColorProductStatus<T extends FieldValues>({
  name,
  control,
  shouldUnregister,
}: ChooseColorProductStatusProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    shouldUnregister,
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center h-[24px]">
        <Label className="text-sm font-medium">Màu sắc</Label>
        <span className="text-red-500 ml-1">*</span>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start",
                !value && "text-muted-foreground"
              )}
            >
              <span
                className="mr-2 h-4 w-4 rounded-full"
                style={{ backgroundColor: value }}
              />
              <span>{value}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-64 p-3">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {predefinedColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-full border-2",
                    value === c
                      ? "border-black dark:border-white"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-10 p-0 border-none"
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </PopoverContent>
        </Popover>

        <div
          className="h-8 w-8 rounded-md"
          style={{ backgroundColor: value }}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
