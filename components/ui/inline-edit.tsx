"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Check, X, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Thêm helper function ở đầu component
const formatValueForDisplay = (value: any): string => {
  if (value instanceof Date) {
    return format(value, "yyyy-MM-dd")
  }
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

const formatValueForInput = (value: any, inputType: string): string => {
  if (value instanceof Date) {
    if (inputType === "date") {
      return format(value, "yyyy-MM-dd")
    }
    return format(value, "yyyy-MM-dd HH:mm")
  }
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

interface InlineEditProps {
  value: string | number | Date | null | undefined
  onSave: (newValue: string) => Promise<void>
  type?: "text" | "textarea" | "number" | "email" | "date"
  placeholder?: string
  className?: string
  displayClassName?: string
  multiline?: boolean
  disabled?: boolean
  maxLength?: number
  rows?: number
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  placeholder = "Click để chỉnh sửa...",
  className = "",
  displayClassName = "",
  multiline = false,
  disabled = false,
  maxLength,
  rows = 3,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(formatValueForInput(value, type))
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(formatValueForInput(value, type))
    setHasChanged(false)
  }, [value, type])

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline])

  const handleStartEdit = () => {
    if (disabled) return
    setIsEditing(true)
    setEditValue(formatValueForInput(value, type))
    setHasChanged(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(formatValueForInput(value, type))
    setHasChanged(false)
  }

  const handleSave = async () => {
    if (!hasChanged || editValue === formatValueForInput(value, type)) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      await onSave(editValue)
      setIsEditing(false)
      setHasChanged(false)
    } catch (error) {
      console.error("Error saving:", error)
      // Có thể hiển thị toast error ở đây
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Enter" && multiline && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleChange = (newValue: string) => {
    setEditValue(newValue)
    setHasChanged(newValue !== formatValueForInput(value, type))
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {multiline ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            className="min-h-[80px]"
          />
        ) : (
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanged} className="h-7 px-2">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="h-7 px-2">
            <X className="h-3 w-3" />
          </Button>
          {multiline && <span className="text-xs text-muted-foreground">Ctrl+Enter để lưu</span>}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded px-2 py-1 hover:bg-muted/50 transition-colors",
        displayClassName,
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={handleStartEdit}
    >
      <div className="flex items-center justify-between">
        <span className={cn("break-words", !value && "text-muted-foreground italic")}>
          {formatValueForDisplay(value) || placeholder}
        </span>
        {!disabled && (
          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity ml-2 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}
