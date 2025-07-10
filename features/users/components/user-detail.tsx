"use client";

import { useParams, useRouter } from "next/navigation";
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
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserQuery } from "../hooks";
import { format } from "date-fns";
import { getUserRole } from "../utils";
import { UserRoleEnum } from "@/features/auth/constants";
import { getRoleName } from "@/helpers";
import { getDepartmentRole } from "@/features/settings/utils";

export function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data: user, isLoading, refetch, error } = useUserQuery(userId);

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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Không tìm thấy người dùng</h1>
        <p className="text-muted-foreground">
          Người dùng bạn đang tìm kiếm không tồn tại.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thông tin người dùng</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {user.data.avatar ? (
                <AvatarImage
                  src={user.data.avatar || "/placeholder.svg"}
                  alt={user.data.fullName}
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {user.data.fullName?.charAt(0) ||
                    user.data.userName?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.data.fullName}</CardTitle>
              <CardDescription className="text-base">
                @{user.data.userName}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    user.data.role === UserRoleEnum.ADMIN ||
                    user.data.role === UserRoleEnum.SUPER_ADMIN
                      ? "default"
                      : "outline"
                  }
                >
                  {getRoleName(user.data.role)}
                </Badge>
                <Badge
                  variant={
                    user.data.isVerifiedAccount ? "default" : "destructive"
                  }
                >
                  {user.data.isVerifiedAccount ? "Hoạt động" : "Vô hiệu hóa"}
                </Badge>

                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {getDepartmentRole(
                    user?.data?.id,
                    user?.data?.department?.headId,
                    user?.data?.department?.id
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{user?.data?.email || "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Số điện thoại</p>
                  <p>{user.data.phoneNumber || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phòng ban</p>
                  <p>{user.data.department?.name || "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ngày tạo tài khoản</p>
                  <p>{format(user.data.createdAt, "dd/MM/yyyy")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Công việc đang thực hiện</TabsTrigger>
          <TabsTrigger value="completed">Công việc đã hoàn thành</TabsTrigger>
          <TabsTrigger value="all">Tất cả công việc</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Công việc đang thực hiện</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu đang được xử lý bởi {user.data.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* {renderRequestsTable(
                                requests.filter(
                                    (req) =>
                                        req.status === 'pending' ||
                                        req.status === 'in_progress' ||
                                        req.status === 'hold'
                                )
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Công việc đã hoàn thành</CardTitle>
                            <CardDescription>
                                Danh sách các yêu cầu đã được hoàn thành bởi {user.data.fullName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* {renderRequestsTable(
                                requests.filter((req) => req.status === 'completed')
                            )} */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả công việc</CardTitle>
              <CardDescription>
                Danh sách tất cả các yêu cầu được giao cho {user.data.fullName}
              </CardDescription>
            </CardHeader>
            {/* <CardContent>{renderRequestsTable(requests)}</CardContent> */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // function renderRequestsTable(requestsList: any[]) {
  //     if (requestsList.length === 0) {
  //         return (
  //             <div className="text-center py-8">
  //                 <p className="text-muted-foreground">Không có yêu cầu nào.</p>
  //             </div>
  //         )
  //     }

  //     return (
  //         <div className="rounded-md border">
  //             <Table>
  //                 <TableHeader>
  //                     <TableRow>
  //                         <TableHead>Mã yêu cầu</TableHead>
  //                         <TableHead>Tiêu đề</TableHead>
  //                         <TableHead>Trạng thái</TableHead>
  //                         <TableHead>Ngày tạo</TableHead>
  //                         <TableHead>Hạn xử lý</TableHead>
  //                         <TableHead className="text-right">Thao tác</TableHead>
  //                     </TableRow>
  //                 </TableHeader>
  //                 <TableBody>
  //                     {requestsList.map((request) => (
  //                         <TableRow key={request.id}>
  //                             <TableCell className="font-medium">
  //                                 {request.id.substring(0, 8)}
  //                             </TableCell>
  //                             <TableCell>{request.title}</TableCell>
  //                             <TableCell>{getStatusBadge(request.status)}</TableCell>
  //                             <TableCell>{formatDate(request.createdAt)}</TableCell>
  //                             <TableCell>
  //                                 {request.dueDate ? formatDate(request.dueDate) : 'Không có'}
  //                             </TableCell>
  //                             <TableCell className="text-right">
  //                                 <Button variant="outline" size="sm" asChild>
  //                                     <Link href={`/dashboard/requests/${request.id}`}>
  //                                         Xem chi tiết
  //                                     </Link>
  //                                 </Button>
  //                             </TableCell>
  //                         </TableRow>
  //                     ))}
  //                 </TableBody>
  //             </Table>
  //         </div>
  //     )
  // }
}
