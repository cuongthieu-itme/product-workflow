import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MaterialRequestFormProps {
  unit: string;
  onCreate: (data: {
    quantity: number;
    expectedDate: Date;
    supplier?: string;
    sourceCountry?: string;
    price?: number;
    reason?: string;
  }) => void;
  onCancel: () => void;
}

export const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({
  unit,
  onCreate,
  onCancel,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [expectedDate, setExpectedDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [supplier, setSupplier] = useState<string>("");
  const [sourceCountry, setSourceCountry] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState<string>("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-md">
      <div className="space-y-2">
        <Label className="text-xs">Số lượng</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="h-7"
          />
          <span className="text-xs">{unit}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Ngày dự kiến</Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-7 text-xs"
            >
              <Calendar className="mr-2 h-3 w-3" />
              {expectedDate ? (
                format(expectedDate, "dd/MM/yyyy", { locale: vi })
              ) : (
                <span>Chọn ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={expectedDate}
              onSelect={(date) => {
                setExpectedDate(date || new Date());
                setDatePickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Nhà cung cấp</Label>
        <Input
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Nhập nhà cung cấp"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Quốc gia nguồn nhập</Label>
        <Input
          value={sourceCountry}
          onChange={(e) => setSourceCountry(e.target.value)}
          placeholder="Nhập quốc gia nguồn nhập"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Giá nhập (VNĐ/{unit})</Label>
        <Input
          type="number"
          value={price ?? ""}
          onChange={(e) =>
            setPrice(e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Nhập giá nhập"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Lý do</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do"
          className="h-16 min-h-0 text-xs"
        />
      </div>
      <div className="flex gap-1 justify-end mt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-xs"
          onClick={() =>
            onCreate({
              quantity,
              expectedDate,
              supplier,
              sourceCountry,
              price,
              reason,
            })
          }
        >
          Tạo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={onCancel}
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};
