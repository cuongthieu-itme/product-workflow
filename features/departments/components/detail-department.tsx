"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  UserCog,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDepartmentQuery } from "../hooks";
import { format } from "date-fns";

export function DetailDepartmentPage() {
  const params = useParams();
  const departmentId = params.id as string;
  const {
    data: department,
    isLoading,
    error,
    refetch,
  } = useDepartmentQuery(departmentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách phòng ban
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Không tìm thấy phòng ban</h1>
        <p className="text-muted-foreground">
          Phòng ban bạn đang tìm kiếm không tồn tại.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách phòng ban
            </Link>
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{department.data.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phòng ban</CardTitle>
          <CardDescription>{department.data.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Số thành viên</p>
                <p className="text-2xl font-bold">
                  {department.data.members.length}
                </p>
              </div>
            </div>
            {/* TODO: Add actual project count */}
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dự án đang hoạt động</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày tạo</p>
                <p className="text-sm">
                  {department.data.createdAt
                    ? format(
                        new Date(department.data.createdAt),
                        "dd/MM/yyyy hh:mm"
                      )
                    : "Chưa xác định"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách thành viên</CardTitle>
                <CardDescription>
                  Tất cả thành viên thuộc phòng ban {department.data.name}
                </CardDescription>
              </div>
              {/* {department.user.length > 0 && (
                <Select
                  value={department.manager || "none"}
                  onValueChange={handleManagerChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn trưởng phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có trưởng phòng</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} */}
            </CardHeader>
            <CardContent>
              {department.data?.members.length > 0 ? (
                <div className="space-y-4">
                  {department.data?.members.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-md ${
                        user.id === department.data.headId
                          ? "bg-primary/5 border-primary/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {
                            //   TODO: Fill value phone number when available
                            /* 
                          {department.data. && (
                            <p className="text-sm text-muted-foreground">
                              SĐT: {user.phone}
                            </p>
                          )} */
                          }
                          <p className="text-sm text-muted-foreground">
                            SĐT: 0912345678
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* TODO: Case manager */}
                        {user.id === department.data.headId && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Trưởng phòng
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <UserCog className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có thành viên nào trong phòng ban này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Dự án</CardTitle>
              <CardDescription>
                Các dự án đang được thực hiện bởi phòng ban{" "}
                {department.data.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Chưa có dự án nào được gán cho phòng ban này.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo</CardTitle>
              <CardDescription>
                Báo cáo hiệu suất của phòng ban {department.data.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Chưa có báo cáo nào cho phòng ban này.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
