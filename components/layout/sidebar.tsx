"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Settings,
  Building,
  FileText,
  ShoppingCart,
  MessageSquare,
  LayoutDashboard,
  Workflow,
  Tag,
  Shield,
  Package,
  Database,
  FolderKanban,
  PieChart,
  ChevronDown,
  ChevronRight,
  Briefcase,
  BarChart3,
  Cog,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { UserRoleEnum } from "@/features/auth/constants";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
    roles?: string[];
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: user } = useGetUserInfoQuery();

  const filteredItems = items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role ?? UserRoleEnum.USER);
  });

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "justify-start w-full text-left",
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline"
          )}
          asChild
        >
          <Link href={item.href} className="flex items-center gap-2 px-3 py-2">
            {item.icon}
            <span className="truncate">{item.title}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
    roles?: string[];
  }[];
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  items,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const pathname = usePathname();

  const hasActiveItem = items.some((item) => pathname === item.href);

  useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [hasActiveItem]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between px-3 py-2 font-semibold text-sm tracking-tight",
            hasActiveItem ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="truncate">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-2">
        <SidebarNav items={items} />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { data: user } = useGetUserInfoQuery();

  const overviewItems = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ];

  const workspaceItems = [
    {
      title: "Yêu cầu",
      href: "/dashboard/requests",
      icon: <MessageSquare className="h-4 w-4" />,
    },

    {
      title: "Nguyên vật liệu",
      href: "/dashboard/materials",
      icon: <Package className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Khách hàng",
      href: "/dashboard/customers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Marketing",
      href: "/dashboard/marketing",
      icon: <FileText className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "R&D",
      href: "/dashboard/rd-management",
      icon: <FolderKanban className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
  ];

  const reportItems = [
    {
      title: "Báo cáo",
      href: "/dashboard/reports",
      icon: <PieChart className="h-4 w-4" />,
    },
  ];

  const systemItems = [
    {
      title: "Quản lý người dùng",
      href: "/dashboard/users",
      icon: <Users className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Quản lý phòng ban",
      href: "/dashboard/departments",
      icon: <Building className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Quản lý trạng thái",
      href: "/dashboard/product-status",
      icon: <Tag className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Quản lý quy trình",
      href: "/dashboard/workflow-management",
      icon: <Workflow className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Quản lý sản phẩm",
      href: "/dashboard/products",
      icon: <ShoppingCart className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
    {
      title: "Quản lý danh mục sản phẩm",
      href: "/dashboard/categories",
      icon: <Folder className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
  ];

  const settingsItems = [
    {
      title: "Cài đặt",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Di chuyển dữ liệu",
      href: "/dashboard/data-migration",
      icon: <Database className="h-4 w-4" />,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    },
  ];

  const isAdmin =
    user?.role === UserRoleEnum.ADMIN ||
    user?.role === UserRoleEnum.SUPER_ADMIN;

  return (
    <aside
      className={cn(
        "h-full bg-background border-r flex flex-col w-full",
        className
      )}
    >
      {/* Sidebar header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold truncate">Hệ thống quản lý</h2>
      </div>

      {/* Sidebar content */}
      <ScrollArea className="flex-1 px-3 py-4">
        {/* Tổng quan */}
        <div className="py-2">
          <SidebarNav items={overviewItems} />
        </div>

        <Separator className="my-2" />

        {/* Không gian làm việc */}
        <div className="py-2">
          <CollapsibleSection
            title="Không gian làm việc"
            icon={<Briefcase className="h-4 w-4" />}
            items={workspaceItems}
            defaultOpen={true}
          />
        </div>

        <Separator className="my-2" />

        {/* Báo cáo - chỉ hiển thị cho admin */}
        {isAdmin && (
          <>
            <div className="py-2">
              <CollapsibleSection
                title="Báo cáo"
                icon={<BarChart3 className="h-4 w-4" />}
                items={reportItems}
                defaultOpen={false}
              />
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Hệ thống - chỉ hiển thị cho admin */}
        {isAdmin && (
          <>
            <div className="py-2">
              <CollapsibleSection
                title="Hệ thống"
                icon={<Cog className="h-4 w-4" />}
                items={systemItems}
                defaultOpen={false}
              />
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Cài đặt - chỉ hiển thị cho admin */}
        {isAdmin && (
          <div className="py-2">
            <CollapsibleSection
              title="Cài đặt"
              icon={<Settings className="h-4 w-4" />}
              items={settingsItems}
              defaultOpen={false}
            />
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
