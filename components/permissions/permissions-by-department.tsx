'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type {
  WorkflowArea,
  PermissionType,
  AllPermissions
} from '@/components/permissions-context'

interface PermissionsByDepartmentProps {
  departments: { id: string; name: string }[]
  workflowAreas: { id: WorkflowArea; name: string }[]
  permissionTypes: { id: PermissionType; name: string; description: string }[]
  permissions: AllPermissions
  onUpdatePermission: (
    department: string,
    area: WorkflowArea,
    permission: PermissionType
  ) => void
  selectedDepartment: string | null
  onSelectDepartment: (department: string) => void
}

export function PermissionsByDepartment({
  departments,
  workflowAreas,
  permissionTypes,
  permissions,
  onUpdatePermission,
  selectedDepartment,
  onSelectDepartment
}: PermissionsByDepartmentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[300px]">
          <Label htmlFor="department-select">Chọn Phòng Ban</Label>
          <Select
            value={selectedDepartment || ''}
            onValueChange={onSelectDepartment}
          >
            <SelectTrigger id="department-select">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedDepartment && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {workflowAreas.map((area) => {
                const currentPermission =
                  permissions[selectedDepartment]?.[area.id] || 'hide'

                return (
                  <div key={area.id} className="space-y-2">
                    <Label>{area.name}</Label>
                    <RadioGroup
                      value={currentPermission}
                      onValueChange={(value) =>
                        onUpdatePermission(
                          selectedDepartment,
                          area.id,
                          value as PermissionType
                        )
                      }
                      className="flex flex-col space-y-1"
                    >
                      {permissionTypes.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={permission.id}
                            id={`${area.id}-${permission.id}`}
                          />
                          <Label
                            htmlFor={`${area.id}-${permission.id}`}
                            className="flex flex-col"
                          >
                            <span>{permission.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {permission.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
