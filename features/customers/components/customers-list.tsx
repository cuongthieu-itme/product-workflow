"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { useCustomersQuery } from "../hooks";
import { CustomerType, SourceEnum } from "../type";
import Link from "next/link";
import { UpdateCustomerForm } from "./update-customer-form";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { genderOptions, sourceOptions } from "../options";
import { AddCustomerDialog } from "./add-customer-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { KEY_EMPTY_SELECT } from "@/components/form/select";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { UserRoleEnum } from "@/features/auth/constants";

export function CustomerList() {
  const { data: user } = useGetUserInfoQuery();
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);
  const [sourceFilter, setSourceFilter] = useState<SourceEnum | undefined>(
    undefined
  );
  const {
    data: customers,
    isFetching,
    refetch,
  } = useCustomersQuery({
    page,
    limit: LIMIT,
    fullName: debouncedSearch,
    source: sourceFilter,
    userId: user?.role === UserRoleEnum.USER ? user.id : undefined,
  });
  const [editingCustomer, setEditingCustomer] = useState<CustomerType | null>(
    null
  );
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerType | null>(
    null
  );

  const handleOpenDeleteDialog = (customer: CustomerType) => {
    setDeleteCustomer(customer);
  };

  const handleOpenEditDialog = (customer: CustomerType) => {
    setEditingCustomer(customer);
  };

  const totalPages = customers
    ? Math.max(PAGE, Math.ceil(customers.total / LIMIT))
    : PAGE;

  const columns: Column<CustomerType>[] = [
    { id: "fullName", header: "Tên khách hàng" },
    {
      id: "email",
      header: "Liên hệ",
      cell: (u) => (
        <div className="space-y-1">
          {u.phoneNumber && (
            <div className="flex items-center text-sm">{u.phoneNumber}</div>
          )}
          {u.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              {u.email}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "gender",
      header: "Giới tính",
      cell: (u) => genderOptions.find((g) => g.value === u.gender)?.label,
    },
    {
      id: "dateOfBirth",
      header: "Ngày sinh",
      cell: (u) => format(new Date(u.dateOfBirth), "dd/MM/yyyy"),
    },
    {
      id: "source",
      header: "Nguồn khách hàng",
      cell: (u) => sourceOptions.find((s) => s.value === u.source)?.label,
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right w-1",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/customers/${u.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Chi tiết
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditDialog(u)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDeleteDialog(u)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Danh sách khách hàng
          </h2>
          <p className="text-muted-foreground">Quản lý thông tin khách hàng</p>
        </div>

        <AddCustomerDialog />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={refetch}
            refreshing={isFetching}
          >
            <Select
              value={sourceFilter}
              onValueChange={(value) => setSourceFilter(value as SourceEnum)}
            >
              <SelectTrigger className="w-24 overflow-hidden text-ellipsis text-left">
                <SelectValue placeholder="Lọc theo nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={KEY_EMPTY_SELECT}>Tất cả nguồn</SelectItem>
                {sourceOptions.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableToolbar>

          <DataTable<CustomerType>
            data={customers?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editingCustomer && (
            <UpdateCustomerForm
              onClose={() => setEditingCustomer(null)}
              customer={editingCustomer}
              open={Boolean(editingCustomer)}
            />
          )}

          {deleteCustomer && (
            <DeleteCustomerDialog
              deletingCustomer={deleteCustomer}
              setDeletingCustomer={setDeleteCustomer}
            />
          )}
        </div>
      </div>
    </div>
  );
}
