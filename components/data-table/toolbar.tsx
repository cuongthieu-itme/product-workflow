// components/data-table/toolbar.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";

interface TableToolbarProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (v: string) => void;
    /** Tuỳ chọn nút phụ như bộ lọc; truyền children để tự vẽ */
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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search box */}
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                />
            </div>

            {/* Extra controls (filter...) */}
            {children}

            {/* Refresh */}
            {onRefresh && (
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="w-full md:w-auto"
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
