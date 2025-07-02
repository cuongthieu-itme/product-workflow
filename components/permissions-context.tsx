"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Các loại quyền truy cập
export type PermissionType = "edit" | "view" | "hide"

// Các khu vực trong quy trình
export type WorkflowArea =
  | "request"
  | "review"
  | "design"
  | "production"
  | "marketing"
  | "launch"
  | "reports"
  | "users"
  | "settings"

// Cấu trúc quyền truy cập cho một phòng ban
export interface DepartmentPermissions {
  [area: string]: PermissionType
}

// Cấu trúc quyền truy cập cho tất cả phòng ban
export interface AllPermissions {
  [department: string]: DepartmentPermissions
}

interface PermissionsContextType {
  permissions: AllPermissions
  updatePermission: (department: string, area: WorkflowArea, permission: PermissionType) => void
  getUserPermission: (department: string, area: WorkflowArea) => PermissionType
  hasEditPermission: (department: string, area: WorkflowArea) => boolean
  hasViewPermission: (department: string, area: WorkflowArea) => boolean
}

// Quyền mặc định
const defaultPermissions: AllPermissions = {
  product: {
    request: "edit",
    review: "edit",
    design: "view",
    production: "view",
    marketing: "view",
    launch: "view",
    reports: "view",
    users: "hide",
    settings: "hide",
  },
  design: {
    request: "view",
    review: "view",
    design: "edit",
    production: "view",
    marketing: "view",
    launch: "view",
    reports: "view",
    users: "hide",
    settings: "hide",
  },
  marketing: {
    request: "view",
    review: "view",
    design: "view",
    production: "view",
    marketing: "edit",
    launch: "view",
    reports: "view",
    users: "hide",
    settings: "hide",
  },
  sales: {
    request: "view",
    review: "view",
    design: "view",
    production: "view",
    marketing: "view",
    launch: "edit",
    reports: "view",
    users: "hide",
    settings: "hide",
  },
  operations: {
    request: "view",
    review: "view",
    design: "view",
    production: "edit",
    marketing: "view",
    launch: "view",
    reports: "view",
    users: "hide",
    settings: "hide",
  },
  admin: {
    request: "edit",
    review: "edit",
    design: "edit",
    production: "edit",
    marketing: "edit",
    launch: "edit",
    reports: "edit",
    users: "edit",
    settings: "edit",
  },
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<AllPermissions>(defaultPermissions)

  // Tải quyền từ localStorage khi component được mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPermissions = localStorage.getItem("departmentPermissions")
      if (savedPermissions) {
        try {
          setPermissions(JSON.parse(savedPermissions))
        } catch (error) {
          console.error("Error parsing permissions:", error)
          // Nếu có lỗi, sử dụng quyền mặc định
          setPermissions(defaultPermissions)
        }
      }
    }
  }, [])

  // Cập nhật quyền cho một phòng ban và khu vực
  const updatePermission = (department: string, area: WorkflowArea, permission: PermissionType) => {
    setPermissions((prevPermissions) => {
      const newPermissions = {
        ...prevPermissions,
        [department]: {
          ...prevPermissions[department],
          [area]: permission,
        },
      }

      // Lưu vào localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("departmentPermissions", JSON.stringify(newPermissions))
      }

      return newPermissions
    })
  }

  // Lấy quyền của người dùng dựa trên phòng ban và khu vực
  const getUserPermission = (department: string, area: WorkflowArea): PermissionType => {
    if (!permissions[department]) {
      return "hide" // Mặc định ẩn nếu không tìm thấy phòng ban
    }

    return permissions[department][area] || "hide"
  }

  // Kiểm tra xem người dùng có quyền chỉnh sửa không
  const hasEditPermission = (department: string, area: WorkflowArea): boolean => {
    return getUserPermission(department, area) === "edit"
  }

  // Kiểm tra xem người dùng có quyền xem không
  const hasViewPermission = (department: string, area: WorkflowArea): boolean => {
    const permission = getUserPermission(department, area)
    return permission === "edit" || permission === "view"
  }

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        updatePermission,
        getUserPermission,
        hasEditPermission,
        hasViewPermission,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider")
  }
  return context
}
