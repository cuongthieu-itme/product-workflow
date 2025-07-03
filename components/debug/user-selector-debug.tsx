'use client'

import { UserSelector } from '../requests/user-selector'

interface UserSelectorDebugProps {
  selectedStep: any
  fieldValues: any
  onFieldChange: (fieldId: string, value: any) => void
}

export function UserSelectorDebug({
  selectedStep,
  fieldValues,
  onFieldChange
}: UserSelectorDebugProps) {
  console.log('🔍 Debug - selectedStep:', selectedStep)
  console.log('🔍 Debug - allowedUsers:', selectedStep?.allowedUsers)
  console.log('🔍 Debug - assigneeRole:', selectedStep?.assigneeRole)

  return (
    <div className="space-y-4 p-4 border border-blue-200 rounded-md bg-blue-50">
      <h3 className="font-semibold text-blue-800">Debug UserSelector</h3>

      <div className="text-sm text-blue-700">
        <p>Step ID: {selectedStep?.id}</p>
        <p>Step Name: {selectedStep?.name}</p>
        <p>AllowedUsers: {JSON.stringify(selectedStep?.allowedUsers || [])}</p>
        <p>AssigneeRole: {selectedStep?.assigneeRole}</p>
      </div>

      <UserSelector
        selectedUser={null}
        onSelectUser={(user) => {
          console.log('🎯 User selected:', user)
          onFieldChange(`step_${selectedStep?.id}_assignee`, user)
        }}
        allowedUsers={selectedStep?.allowedUsers || []}
        assigneeRole={selectedStep?.assigneeRole}
        placeholder="Chọn người đảm nhiệm (Debug)"
      />
    </div>
  )
}
