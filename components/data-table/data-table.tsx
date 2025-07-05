// components/data-table/index.tsx
"use client";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";              // hàm gộp class, nếu bạn dùng
import type { Column } from "./types";

interface DataTableProps<T> {
    data: readonly T[] | undefined;             // có thể undefined khi đang fetch
    columns: Column<T>[];
    loading?: boolean;
    emptyText?: string;
    /** Khoảng cách đường viền ngoài */
    className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    loading = false,
    emptyText = "Không có dữ liệu",
    className,
}: DataTableProps<T>) {
    return (
        <div className={cn("rounded-md border", className)}>
            <Table>
                {/* ----- HEAD ----- */}
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.id} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                {/* ----- BODY ----- */}
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Đang tải dữ liệu…
                            </TableCell>
                        </TableRow>
                    ) : !data || data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, idx) => (
                            <TableRow key={/* ưu tiên field id nếu có */ (row as any).id ?? idx}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        className={cn(col.className, "align-middle")}
                                    >
                                        {col.cell ? col.cell(row, idx) : (row as any)[col.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
