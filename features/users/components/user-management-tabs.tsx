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
import { AddUserForm } from "./add-user-form";

export function UserManagementTabs() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Tabs
      defaultValue="users"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-4">
        <TabsTrigger value="users">Danh sách tài khoản</TabsTrigger>
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
            <AddUserForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
