'use client'
import { format, parse, isValid } from 'date-fns'
import type React from 'react'

import { CalendarIcon } from 'lucide-react'
import { vi } from 'date-fns/locale'
import { useState, useEffect } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const [inputValue, setInputValue] = useState<string>(
    date ? format(date, 'dd/MM/yyyy') : ''
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Cập nhật input khi date thay đổi từ bên ngoài
  useEffect(() => {
    if (date) {
      setInputValue(format(date, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }, [date])

  // Hàm format input tự động
  const formatDateInput = (value: string) => {
    // Chỉ giữ lại số
    const numbersOnly = value.replace(/\D/g, '')

    // Giới hạn tối đa 8 số (ddmmyyyy)
    const limitedNumbers = numbersOnly.slice(0, 8)

    let formatted = ''

    // Thêm dấu / tự động
    for (let i = 0; i < limitedNumbers.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '/'
      }
      formatted += limitedNumbers[i]
    }

    return formatted
  }

  // Xử lý khi người dùng nhập vào input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const formattedValue = formatDateInput(rawValue)

    setInputValue(formattedValue)

    // Nếu input rỗng, set date về undefined
    if (!formattedValue.trim()) {
      setDate(undefined)
      return
    }

    // Chỉ thử parse khi đã nhập đủ 10 ký tự (dd/mm/yyyy)
    if (formattedValue.length === 10) {
      try {
        const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date())
        if (isValid(parsedDate)) {
          setDate(parsedDate)
        } else {
          setDate(undefined)
        }
      } catch (error) {
        setDate(undefined)
      }
    } else {
      // Nếu chưa nhập đủ, không set date
      setDate(undefined)
    }
  }

  // Xử lý khi người dùng chọn ngày từ calendar
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setIsCalendarOpen(false)
  }

  // Kiểm tra xem ngày có hợp lệ không
  const isDateValid = () => {
    if (inputValue.length !== 10) return true // Không hiển thị lỗi khi đang nhập
    try {
      const parsedDate = parse(inputValue, 'dd/MM/yyyy', new Date())
      return isValid(parsedDate)
    } catch {
      return false
    }
  }

  return (
    <div className="relative">
      <div className="flex">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
          className={cn('pr-10', !isDateValid() && 'border-red-500', className)}
          maxLength={10}
        />
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              initialFocus
              locale={vi}
            />
          </PopoverContent>
        </Popover>
      </div>
      {inputValue.length === 10 && !isDateValid() && (
        <p className="text-xs text-red-500 mt-1">
          Ngày không hợp lệ. Vui lòng kiểm tra lại.
        </p>
      )}
    </div>
  )
}
