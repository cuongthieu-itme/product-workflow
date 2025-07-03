'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface DateTimePickerProps {
  value?: Date | string
  onChange: (date: Date | undefined) => void
  placeholder?: string
  includeTime?: boolean
  onIncludeTimeChange?: (includeTime: boolean) => void
  showTimeToggle?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  includeTime = false,
  onIncludeTimeChange,
  showTimeToggle = false
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  )
  const [selectedTime, setSelectedTime] = useState({
    hours: selectedDate ? selectedDate.getHours() : 9,
    minutes: selectedDate ? selectedDate.getMinutes() : 0
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date)
      if (includeTime) {
        newDate.setHours(selectedTime.hours, selectedTime.minutes, 0, 0)
      } else {
        newDate.setHours(0, 0, 0, 0)
      }
      setSelectedDate(newDate)
      onChange(newDate)
    } else {
      setSelectedDate(undefined)
      onChange(undefined)
    }
  }

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const numValue = Number.parseInt(value, 10)
    const newTime = {
      ...selectedTime,
      [type]: numValue
    }
    setSelectedTime(newTime)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(newTime.hours, newTime.minutes, 0, 0)
      setSelectedDate(newDate)
      onChange(newDate)
    }
  }

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder

    if (includeTime) {
      return format(selectedDate, "PPP 'lúc' HH:mm", { locale: vi })
    } else {
      return format(selectedDate, 'PPP', { locale: vi })
    }
  }

  return (
    <div className="space-y-2">
      {showTimeToggle && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-time"
            checked={includeTime}
            onCheckedChange={(checked) => onIncludeTimeChange?.(!!checked)}
          />
          <Label htmlFor="include-time" className="text-sm">
            Bao gồm giờ phút
          </Label>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />

            {includeTime && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <Label className="text-sm font-medium">Thời gian</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTime.hours.toString()}
                    onValueChange={(value) => handleTimeChange('hours', value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select
                    value={selectedTime.minutes.toString()}
                    onValueChange={(value) =>
                      handleTimeChange('minutes', value)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
