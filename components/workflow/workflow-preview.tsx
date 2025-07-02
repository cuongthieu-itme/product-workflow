"use client"

import type React from "react"
import type { Step } from "@/interfaces/workflow"
import { UserSelector } from "../requests/user-selector"

interface WorkflowPreviewProps {
  currentStep: Step | undefined
  onFieldChange: (fieldId: string, value: any) => void
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ currentStep, onFieldChange }) => {
  const renderField = (field: any, value: any) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.name}
          />
        )
      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onFieldChange(field.id, Number(e.target.value))}
            placeholder={field.name}
          />
        )
      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.name}
          />
        )
      case "user":
        return (
          <UserSelector
            selectedUser={typeof value === "object" && value !== null ? value : null}
            onSelectUser={(user) => onFieldChange(field.id, user)}
            allowedUsers={currentStep?.allowedUsers || []}
            assigneeRole={currentStep?.assigneeRole}
            placeholder={`Chọn ${field.name.toLowerCase()}`}
          />
        )
      default:
        return <p>Unsupported field type: {field.type}</p>
    }
  }

  return (
    <div>
      {currentStep &&
        currentStep.fields &&
        currentStep.fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id}>{field.name}:</label>
            {renderField(field, currentStep.values ? currentStep.values[field.id] : null)}
          </div>
        ))}
    </div>
  )
}
