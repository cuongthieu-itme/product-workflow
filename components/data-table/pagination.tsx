// components/data-table/pagination.tsx
"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const getPageNumbers = (): (number | "…")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push("…");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  const nums = getPageNumbers();

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(page - 1, 1));
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {nums.map((n, i) => (
          <PaginationItem key={i}>
            {n === "…" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                className="cursor-pointer"
                isActive={n === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(n);
                }}
              >
                {n}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(page + 1, totalPages));
            }}
            className={
              page === totalPages ? "pointer-events-none opacity-50 " : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
