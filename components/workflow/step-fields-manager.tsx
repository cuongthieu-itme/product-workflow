'use client'

import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label
} from '@/components/ui'
import { DateTimePicker } from '../variables/date-time-picker'
import { MultiSelect } from '../variables/multi-select'

type StepField = {
  id: string
  name: string
  type: string
  options?: string[]
}

interface StepFieldsManagerProps {
  fields: StepField[]
  fieldValues: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
}

export function StepFieldsManager({
  fields,
  fieldValues,
  onFieldChange
}: StepFieldsManagerProps) {
  const getFieldValue = (fieldId: string) => {
    return fieldValues[fieldId]
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    onFieldChange(fieldId, value)
  }

  const renderFieldInput = (field: StepField) => {
    const fieldValue = getFieldValue(field.id)

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )

      case 'date':
        return (
          <DateTimePicker
            value={fieldValue}
            onChange={(date) => handleFieldChange(field.id, date)}
            placeholder={`Chọn ${field.name.toLowerCase()}`}
            includeTime={false}
          />
        )

      case 'datetime':
        return (
          <DateTimePicker
            value={fieldValue}
            onChange={(date) => handleFieldChange(field.id, date)}
            placeholder={`Chọn ${field.name.toLowerCase()}`}
            includeTime={true}
          />
        )

      case 'select':
        return (
          <Select
            value={fieldValue || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <MultiSelect
            options={field.options || []}
            value={Array.isArray(fieldValue) ? fieldValue : []}
            onChange={(value) => handleFieldChange(field.id, value)}
            placeholder={`Chọn ${field.name.toLowerCase()}`}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!fieldValue}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, !!checked)
              }
            />
            <Label className="text-sm">{field.name}</Label>
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue || ''}
            onChange={(e) =>
              handleFieldChange(field.id, e.target.valueAsNumber)
            }
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <Input
              type="number"
              value={fieldValue || ''}
              onChange={(e) =>
                handleFieldChange(field.id, e.target.valueAsNumber)
              }
              placeholder={`Nhập ${field.name.toLowerCase()}`}
              className="pl-12"
            />
            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none border-r">
              VND
            </div>
          </div>
        )

      case 'user':
        return (
          <Select
            value={fieldValue || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">Nguyễn Văn A</SelectItem>
              <SelectItem value="user2">Trần Thị B</SelectItem>
              <SelectItem value="user3">Lê Văn C</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )
    }
  }

  return (
    <div>
      {fields.map((field) => (
        <div key={field.id} className="mb-4">
          <Label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700"
          >
            {field.name}
          </Label>
          {renderFieldInput(field)}
        </div>
      ))}
    </div>
  )
}
