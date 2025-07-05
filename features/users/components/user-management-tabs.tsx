"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersList } from "./users-list";
import { PendingAccounts } from "./pending-accounts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { AddUserForm } from "./add-user-form";

export function UserManagementTabs() {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const pendingUsersRef = collection(db, "pendingUsers");
        const snapshot = await getDocs(pendingUsersRef);
        setPendingCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching pending users count:", error);
      }
    };

    fetchPendingCount();
    // Thiết lập interval để cập nhật số lượng tài khoản chờ duyệt mỗi 30 giây
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      defaultValue="users"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-4">
        <TabsTrigger value="users">Danh sách tài khoản</TabsTrigger>
        <TabsTrigger value="pending">
          Tài khoản chờ duyệt
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="add">Thêm tài khoản mới</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tài khoản</CardTitle>
            <CardDescription>
              Quản lý tất cả tài khoản người dùng trong hệ thống. Bạn có thể
              chỉnh sửa, đặt lại mật khẩu hoặc vô hiệu hóa tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersList />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản chờ duyệt</CardTitle>
            <CardDescription>
              Danh sách các tài khoản đang chờ được duyệt. Bạn có thể duyệt hoặc
              từ chối các tài khoản này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingAccounts
              onApprove={() => {
                // Cập nhật lại số lượng tài khoản chờ duyệt
                const fetchPendingCount = async () => {
                  try {
                    const pendingUsersRef = collection(db, "pendingUsers");
                    const snapshot = await getDocs(pendingUsersRef);
                    setPendingCount(snapshot.size);
                  } catch (error) {
                    console.error("Error fetching pending users count:", error);
                  }
                };
                fetchPendingCount();
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle>Thêm tài khoản mới</CardTitle>
            <CardDescription>
              Tạo tài khoản mới trực tiếp trong hệ thống. Tài khoản được tạo bởi
              admin sẽ được kích hoạt ngay lập tức.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddUserForm onSuccess={() => setActiveTab("users")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
