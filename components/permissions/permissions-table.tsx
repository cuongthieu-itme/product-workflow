'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type {
  WorkflowArea,
  PermissionType,
  AllPermissions
} from '@/components/permissions-context'

interface PermissionsTableProps {
  departments: { id: string; name: string }[]
  workflowAreas: { id: WorkflowArea; name: string }[]
  permissionTypes: { id: PermissionType; name: string; description: string }[]
  permissions: AllPermissions
  onUpdatePermission: (
    department: string,
    area: WorkflowArea,
    permission: PermissionType
  ) => void
}

export function PermissionsTable({
  departments,
  workflowAreas,
  permissionTypes,
  permissions,
  onUpdatePermission
}: PermissionsTableProps) {
  // Lấy badge variant dựa trên loại quyền
  const getPermissionBadgeVariant = (permission: PermissionType) => {
    switch (permission) {
      case 'edit':
        return 'default'
      case 'view':
        return 'outline'
      case 'hide':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Phòng Ban</TableHead>
            {workflowAreas.map((area) => (
              <TableHead key={area.id}>{area.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              {workflowAreas.map((area) => {
                const currentPermission =
                  permissions[department.id]?.[area.id] || 'hide'

                return (
                  <TableCell key={area.id}>
                    <Select
                      value={currentPermission}
                      onValueChange={(value) =>
                        onUpdatePermission(
                          department.id,
                          area.id,
                          value as PermissionType
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Chọn quyền">
                          <Badge
                            variant={getPermissionBadgeVariant(
                              currentPermission
                            )}
                          >
                            {permissionTypes.find(
                              (p) => p.id === currentPermission
                            )?.name || 'Ẩn'}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {permissionTypes.map((permission) => (
                          <SelectItem key={permission.id} value={permission.id}>
                            <div className="flex flex-col">
                              <span>{permission.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {permission.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
