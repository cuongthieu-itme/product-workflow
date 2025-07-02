"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

export function DateTimePicker({ date, setDate, className, placeholder = "Chọn ngày và giờ" }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Tạo mảng giờ và phút
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Giữ nguyên giờ phút hiện tại nếu có, hoặc set mặc định 08:00
      const currentTime = date || new Date()
      selectedDate.setHours(currentTime.getHours())
      selectedDate.setMinutes(currentTime.getMinutes())
      setDate(selectedDate)
    } else {
      setDate(undefined)
    }
  }

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (!date) {
      // Nếu chưa có ngày, tạo ngày mới với thời gian hiện tại
      const newDate = new Date()
      if (type === "hour") {
        newDate.setHours(Number.parseInt(value))
      } else {
        newDate.setMinutes(Number.parseInt(value))
      }
      setDate(newDate)
    } else {
      const newDate = new Date(date)
      if (type === "hour") {
        newDate.setHours(Number.parseInt(value))
      } else {
        newDate.setMinutes(Number.parseInt(value))
      }
      setDate(newDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy HH:mm", { locale: vi }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus locale={vi} />
          <div className="border-l border-border p-3 space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <Label className="text-sm font-medium">Thời gian</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Giờ</Label>
              <Select
                value={date ? date.getHours().toString().padStart(2, "0") : "08"}
                onValueChange={(value) => handleTimeChange("hour", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Phút</Label>
              <Select
                value={date ? date.getMinutes().toString().padStart(2, "0") : "00"}
                onValueChange={(value) => handleTimeChange("minute", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsOpen(false)} className="w-full mt-4" size="sm">
              Xác nhận
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
