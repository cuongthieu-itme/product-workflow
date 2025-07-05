// components/data-table/types.ts
import type { ReactNode } from "react";

export type Column<T> = {
    /** Khóa duy nhất cho React; không cần trùng field trong dữ liệu */
    id: string;
    /** Tiêu đề hiển thị */
    header: ReactNode;
    /**
     * Hàm vẽ ô; nhận object gốc + index
     * Nếu không truyền -> hiển thị `row[id]` (phù hợp field phẳng).
     */
    cell?: (row: T, index: number) => React.ReactNode;
    /** Lớp tùy biến cho <TableCell> */
    className?: string;
};
