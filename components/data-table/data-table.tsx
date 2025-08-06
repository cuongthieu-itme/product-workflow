// components/data-table/index.tsx

"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils"; // hàm gộp class, nếu bạn dùng
import type { Column } from "./types";
import { Loader } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface DataTableProps<T> {
  data: readonly T[] | undefined; // có thể undefined khi đang fetch
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
              <TableHead key={col.id} className={cn(col.className, "min-w-10")}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* ----- BODY ----- */}
        <TableBody>
          {loading ? (
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} className="p-4">
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Skeleton
                        key={idx}
                        className={`h-8 w-full animate-pulse rounded-lg bg-gray-100
        ${col.className?.includes("text-center") ? "mx-auto" : ""}
        ${col.className?.includes("text-right") ? "ml-auto" : ""}
      `}
                      />
                    ))}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={/* ưu tiên field id nếu có */ (row as any).id ?? idx}
              >
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
