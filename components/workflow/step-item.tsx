'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepItemProps {
  step: {
    id: string
    name: string
    description?: string
    [key: string]: any
  }
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

export function StepItem({
  step,
  selected,
  onSelect,
  disabled = false
}: StepItemProps) {
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      className={cn(
        'h-auto justify-start px-3 py-2 text-left',
        selected && 'bg-primary text-primary-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-primary-foreground' : 'border-primary'
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </div>
        <div className="text-sm font-medium">{step.name}</div>
      </div>
    </Button>
  )
}
