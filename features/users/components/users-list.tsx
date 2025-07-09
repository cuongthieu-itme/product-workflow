// features/users/components/users-list.tsx
"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/data-table/toolbar";
import { TablePagination } from "@/components/data-table/pagination";
import { Badge } from "@/components/ui/badge";
import { Edit, Key, UserCheck, Eye } from "lucide-react";
import { UserRoleEnum } from "@/features/auth/constants";
import type { Column } from "@/components/data-table/types";
import { useUsersQuery } from "../hooks";
import { User } from "../type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PasswordDialog } from "./password-dialog";
import { UpdateUserDialog } from "./update-user-dialog";
import { KEY_EMPTY_SELECT } from "@/components/form/select";
import { userRoles } from "../options";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { DepartmentType } from "@/features/departments/type";
import { UserVerifyAccountDialog } from "./user-verify-account-dialog";
import Link from "next/link";
import { getUserRole } from "../utils";
import { useDebounce } from "@/hooks/use-debounce";

export function UsersList() {
  const [page, setPage] = useState(1);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState(KEY_EMPTY_SELECT);
  const [filterDepartment, setFilterDepartment] = useState(KEY_EMPTY_SELECT);
  const [filterStatus, setFilterStatus] = useState(KEY_EMPTY_SELECT);
  const [searchValue, setSearchValue] = useState("");
  const [isVerifiedAccountId, setIsVerifiedAccountId] = useState<string | null>(
    null
  );
  const { data: departments } = useDepartmentsQuery();
  const debouncedSearch = useDebounce(searchValue, 400);

  const {
    data: usersResp,
    isFetching,
    refetch,
  } = useUsersQuery({
    isVerifiedAccount:
      filterStatus === "true"
        ? true
        : filterStatus === "false"
        ? false
        : undefined,
    departmentId: filterDepartment,
    role: filterRole as UserRoleEnum | undefined,
    fullName: debouncedSearch,
  });

  const columns: Column<User>[] = [
    { id: "userName", header: "Tên đăng nhập" },
    { id: "fullName", header: "Họ tên" },
    { id: "email", header: "Email" },
    {
      id: "phoneNumber",
      header: "Số điện thoại",
      cell: (u) => u.phoneNumber || "Chưa cập nhật",
    },
    {
      id: "role",
      header: "Vai trò",
      cell: (u) => (
        <Badge variant={u.role === UserRoleEnum.ADMIN ? "default" : "outline"}>
          {getUserRole(u.role)}
        </Badge>
      ),
    },
    {
      id: "department",
      header: "Phòng ban",
      cell: (u) => u.department?.name || "Chưa có",
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (u) => (
        <Badge variant={u.isVerifiedAccount ? "default" : "destructive"}>
          {u.isVerifiedAccount ? "Hoạt động" : "Vô hiệu hóa"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right w-100",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon">
            <Link href={`/dashboard/users/${u.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setEditingUser(u);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setResetPasswordUser(u);
            }}
          >
            <Key className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            disabled={u.isVerifiedAccount}
            onClick={() => {
              setIsVerifiedAccountId(u.id);
            }}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = useMemo(() => {
    if (!usersResp) return 0;
    const { total, limit } = usersResp;
    return Math.ceil(total / limit);
  }, [usersResp]);

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <div className="flex flex-row gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={KEY_EMPTY_SELECT}>Tất cả vai trò</SelectItem>
              {userRoles.map((role) => (
                <SelectItem key={role.value} value={String(role.value)}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={KEY_EMPTY_SELECT}>Tất cả phòng ban</SelectItem>
              {departments &&
                departments?.data.map((dept: DepartmentType) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(filterStatus) => setFilterStatus(filterStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={KEY_EMPTY_SELECT}>
                Tất cả trạng thái
              </SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Vô hiệu hóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableToolbar>

      <DataTable<User>
        data={usersResp?.data}
        columns={columns}
        loading={isFetching}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <PasswordDialog
        resetPasswordUser={resetPasswordUser}
        setResetPasswordUser={setResetPasswordUser}
      />

      <UpdateUserDialog
        editingUser={editingUser}
        setEditingUser={setEditingUser}
      />

      {isVerifiedAccountId && (
        <UserVerifyAccountDialog
          userId={isVerifiedAccountId}
          onClose={() => setIsVerifiedAccountId(null)}
        />
      )}
    </div>
  );
}
