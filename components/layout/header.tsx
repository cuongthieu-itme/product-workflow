"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Bell, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useGetUserInfoQuery } from "@/pages/auth/hooks";
import { UserRoleEnum } from "@/pages/auth/constants";
import { getRoleName } from "@/helpers";

export default function Header() {
  const router = useRouter();
  const { data } = useGetUserInfoQuery();
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <header className="flex h-14 items-center justify-between w-full">
      {/* Logo/Title - hidden on mobile, shown on larger screens */}
      <div className="hidden md:flex items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-bold text-lg">Dashboard</span>
        </Link>
      </div>

      {/* Mobile title */}
      <div className="md:hidden">
        <span className="font-semibold text-lg">Dashboard</span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2">
        {/* Notifications - responsive */}
        {data?.role === UserRoleEnum.ADMIN && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {passwordRequests.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {passwordRequests.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-w-[calc(100vw-2rem)]"
            >
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {passwordRequests.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không có thông báo mới
                </div>
              ) : (
                <>
                  {passwordRequests.map((request) => (
                    <DropdownMenuItem
                      key={request.id}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="font-medium text-sm">
                          Yêu cầu đặt lại mật khẩu
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Người dùng{" "}
                          <span className="font-medium">
                            {request.username}
                          </span>{" "}
                          đã yêu cầu đặt lại mật khẩu
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(request.requestedAt)}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer justify-center"
                  >
                    <Link href="/dashboard/users?tab=password-requests">
                      Xem tất cả
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 px-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline-block max-w-24 truncate">
                {data?.userName ?? "Người dùng"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <span className="truncate">
                  {data?.userName ?? "Người dùng"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {getRoleName(data?.role ?? UserRoleEnum.USER)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Cài đặt</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
