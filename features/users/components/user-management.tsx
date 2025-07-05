"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { AddUserForm } from "./add-user-form";
import { PasswordResetRequests } from "./password-reset-requests";
import { UserReports } from "./user-reports";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUsersQuery } from "../hooks";
import { PendingAccounts } from "./pending-accounts";

export function UserManagement() {
  const { toast } = useToast();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUserAdded = () => {
    // Cập nhật state để kích hoạt việc làm mới danh sách người dùng
    setRefreshUsers((prev) => prev + 1);
    // Đóng dialog sau khi thêm thành công
    setIsDialogOpen(false);
  };

  const { data: users } = useUsersQuery({ isVerifiedAccount: false });
  const pendingCount = users?.data.length ? users.data.length + 1 : 0; // Giả sử có 1 tài khoản chờ duyệt

  if (userRole !== "admin") {
    return null;
  }

  return (
    <Tabs
      defaultValue="users"
      className="space-y-4"
      // onValueChange={updatePendingCount}
    >
      <TabsList>
        <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
        <TabsTrigger value="pending-accounts" className="relative">
          Tài khoản chờ duyệt
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="password-requests">
          Yêu cầu đặt lại mật khẩu
        </TabsTrigger>
        <TabsTrigger value="reports">Báo cáo</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Quản lý tài khoản người dùng trong hệ thống
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Tạo tài khoản
              </Button>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                </DialogHeader>
                <AddUserForm onUserAdded={handleUserAdded} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <UsersList key={refreshUsers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending-accounts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tài khoản chờ duyệt
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount} tài khoản
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Quản lý các tài khoản đang chờ duyệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingAccounts />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="password-requests" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Xử lý các yêu cầu đặt lại mật khẩu từ người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetRequests />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo hoạt động</CardTitle>
            <CardDescription>
              Báo cáo về hoạt động quản lý tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserReports />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
