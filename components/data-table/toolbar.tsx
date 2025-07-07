// components/data-table/toolbar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";

interface TableToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  children?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TableToolbar({
  searchPlaceholder = "Tìm kiếm…",
  searchValue,
  onSearchChange,
  children,
  onRefresh,
  refreshing,
}: TableToolbarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-stretch">
      {/* Ô tìm kiếm */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-full"
        />
      </div>

      {/* Các bộ lọc / controls bổ sung */}
      {children}

      {/* Nút refresh */}
      {onRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className=" shrink-0 maw-[120px] w-[120px]"
        >
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang tải…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </>
          )}
        </Button>
      )}
    </div>
  );
}
