"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCurrentUserQuery } from "../hooks";
import { ChangePasswordTab } from "./change-password-tab";
import { ChangeInformationTab } from "./change-information-tab";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountSettings() {
  const { isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
          </TabsList>
        </Tabs>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ChangeInformationTab />
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
                  <Switch id="twoFactor" checked={false} />
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
                    value={30}
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
    </div>
  );
}
