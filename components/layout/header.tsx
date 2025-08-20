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
import { useRouter } from "next/navigation";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { UserRoleEnum } from "@/features/auth/constants";
import { getRoleName } from "@/helpers";
import { removeAccessTokenFromStorage } from "@/utils/localStorage";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationsPopover } from "./notifications-popover";

export default function Header() {
  const router = useRouter();
  const { data } = useGetUserInfoQuery();
  const queryClient = useQueryClient();
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);

  const handleLogout = () => {
    removeAccessTokenFromStorage();
    queryClient.removeQueries();
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

  const isAdmin =
    data?.role === UserRoleEnum.ADMIN ||
    data?.role === UserRoleEnum.SUPER_ADMIN;

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
        <NotificationsPopover />

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
