"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Mail, Building, Shield, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { useForm } from "react-hook-form";
import { CurrentUserUpdateInputType } from "@/features/users/schema/update-user-schema";
import { InputCustom } from "@/components/form/input";
import { ChangePasswordTab } from "./change-password-tab";
import { AvatarSetting } from "./avatar-setting";

export function AccountSettings() {
  const [formData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const { data: user, isLoading } = useGetUserInfoQuery();

  const { control } = useForm<CurrentUserUpdateInputType>({
    defaultValues: {
      email: user?.email,
      fullName: user?.fullName,
      phoneNumber: "",
      userName: user?.userName,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin người dùng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      {user && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Xem và cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarSetting
                  user={user}
                  onAvatarChange={(avatarUrl) => {
                    console.log(avatarUrl);
                  }}
                />

                <form noValidate className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Tên đăng nhập
                      </Label>
                      <Input
                        id="username"
                        value={user.userName}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tên đăng nhập không thể thay đổi
                      </p>
                    </div>

                    <InputCustom
                      control={control}
                      name="fullName"
                      label="Họ và tên"
                      labelIcon={<User className="h-4 w-4" />}
                    />

                    <InputCustom
                      control={control}
                      name="email"
                      label="Email"
                      labelIcon={<Mail className="h-4 w-4" />}
                    />

                    <InputCustom
                      control={control}
                      name="phoneNumber"
                      label="Số điện thoại"
                      labelIcon={<Phone className="h-4 w-4" />}
                    />

                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="flex items-center gap-2"
                      >
                        <Building className="h-4 w-4" /> Phòng ban
                      </Label>
                      <Input
                        id="department"
                        value="Phòng kế hoạch"
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="position"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" /> Chức vụ
                      </Label>
                      <Input
                        id="position"
                        value="Nhân viên"
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cập nhật thông tin
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <ChangePasswordTab />
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <form>
                <CardHeader>
                  <CardTitle>Bảo mật tài khoản</CardTitle>
                  <CardDescription>
                    Cài đặt bảo mật cho tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactor">Xác thực hai yếu tố</Label>
                      <p className="text-sm text-muted-foreground">
                        Bật xác thực hai yếu tố để tăng cường bảo mật cho tài
                        khoản của bạn
                      </p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={formData.twoFactorEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Thời gian hết phiên (phút)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.sessionTimeout}
                    />
                    <p className="text-sm text-muted-foreground">
                      Thời gian không hoạt động trước khi tự động đăng xuất
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Lưu cài đặt
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
