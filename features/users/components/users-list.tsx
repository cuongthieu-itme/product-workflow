// features/users/components/users-list.tsx
"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/data-table/toolbar";
import { TablePagination } from "@/components/data-table/pagination";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Key } from "lucide-react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordDialog } from "./password-dialog";
import { UpdateUserDialog } from "./update-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

// ----------------------------------------------------------------

export function UsersList() {
  const [page, setPage] = useState(1);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const limit = 10;

  const { data: usersResp, isFetching, refetch } = useUsersQuery();
  const totalPages = usersResp
    ? Math.max(1, Math.ceil(usersResp.total / limit))
    : 1;

  /* -------------------- cấu hình cột -------------------- */
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
          {u.role === UserRoleEnum.ADMIN ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      id: "department",
      header: "Phòng ban",
      cell: () => "Tlinh", // TODO: map phòng ban thật
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
      header: <span className="sr-only">Thao tác</span>,
      className: "text-right w-1",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon"
            onClick={() => {
              setEditingUser(u);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon"
            onClick={() => {
              setResetPasswordUser(u);
            }}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon"
            onClick={() => {
              setDeletingUser(u);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  console.log("usersResp", resetPasswordUser);

  /* -------------------- render -------------------- */
  return (
    <div className="space-y-4">
      {/* Toolbar chung cho mọi list */}
      <TableToolbar
        searchValue={"" /* state search */}
        onSearchChange={() => { }}
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Lọc theo phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            <SelectItem value="mkt">Marketing</SelectItem>
            <SelectItem value="rd">R&D</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="bod">Ban Giám Đốc</SelectItem>
          </SelectContent>
        </Select>
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
      <DeleteUserDialog
        deletingUser={deletingUser}
        setDeletingUser={setDeletingUser}
      />
    </div>
  );
}
