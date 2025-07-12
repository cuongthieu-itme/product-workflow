"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Power } from "lucide-react";
import type { Column } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { MaterialType } from "../type";
import Image from "next/image";
import { CreateMaterialForm, MaterialForm } from "./material-form-dialog";
import { useMaterialsQuery } from "../hooks";
import { ToggleStatusMaterialDialog } from "./toggle-status-material-dialog";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/features/settings/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useOriginsQuery, useUnitsQuery } from "../hooks/useMaterials";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KEY_EMPTY_SELECT, SelectOption } from "@/components/form/select";
import { ToolbarFilters } from "@/components/data-table/toolbar-filter";
import { ImageDialog } from "./image-dialog";

export function MaterialList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [filterOrigin, setFilterOrigin] = useState(KEY_EMPTY_SELECT);
  const [filterStatus, setFilterStatus] = useState(KEY_EMPTY_SELECT);
  const [filterUnit, setFilterUnit] = useState(KEY_EMPTY_SELECT);
  const {
    data: materials,
    isFetching,
    refetch,
  } = useMaterialsQuery({
    page,
    limit: LIMIT,
    name: debouncedSearchValue,
    origin: filterOrigin,
    isActive: filterStatus === KEY_EMPTY_SELECT ? undefined : Boolean(Number(filterStatus)),
    unit: filterUnit,
  });
  const [editForm, setEditForm] = useState<MaterialType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [toggleStatusForm, setToggleStatusForm] = useState<MaterialType | null>(
    null
  );
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [nameImage, setNameImage] = useState("");
  const handleCloseImageDialog = () => {
    setIsImageDialogOpen(false);
    setImages([]);
    setNameImage("");
  };
  const handleOpenImageDialog = (images: string[], nameImage: string) => {
    setImages(images);
    setIsImageDialogOpen(true);
    setNameImage(nameImage);
  };

  const { data: origins, refetch: refetchOrigins } = useOriginsQuery();
  const { data: units, refetch: refetchUnits } = useUnitsQuery();

  const handleOpenChangeStatusDialog = (customer: MaterialType) => {
    setToggleStatusForm(customer);
  };

  const handleOpenEditDialog = (customer: MaterialType) => {
    setEditForm(customer);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditForm(null);
    setIsEditDialogOpen(false);
  };

  const totalPages = materials
    ? Math.max(PAGE, Math.ceil(materials.total / LIMIT))
    : PAGE;

  const columns: Column<MaterialType>[] = [
    {
      id: "image",
      header: "Hình ảnh",
      cell: (u) => (
        <Image
          src={getImageUrl(u.image[0])}
          alt={u.name}
          width={50}
          height={50}
          className="rounded-sm"
          onClick={() => handleOpenImageDialog(u.image, u.name)}
        />
      ),
    },
    { id: "name", header: "Tên nguyên liệu" },
    {
      id: "code",
      header: "Mã nguyên liệu",
    },
    {
      id: "quantity",
      header: "Số lượng",
      cell: (u) => u.quantity,
    },
    {
      id: "unit",
      header: "Đơn vị",
      cell: (u) => units?.data.find((unit) => unit.value == u.unit)?.label ?? u.unit,
    },
    {
      id: "origin",
      header: "Xuất xứ",
      cell: (u) => origins?.data.find((origin) => origin.value == u.origin)?.label ?? u.origin,
    },
    {
      id: "isActive",
      header: "Trạng thái",
      cell: (u) => (
        <Badge
          variant={u.isActive ? "default" : "destructive"}
          className="text-xs"
        >
          {u.isActive ? "Còn hàng" : "Hết hàng"}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Ngày tạo",
      cell: (u) => format(new Date(u.createdAt), "dd/MM/yyyy hh:mm"),
    },
    {
      id: "updatedAt",
      header: "Ngày cập nhật",
      cell: (u) => format(new Date(u.updatedAt), "dd/MM/yyyy hh:mm"),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right w-1",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleOpenEditDialog(u);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChangeStatusDialog(u)}
          >
            <Power className="h-4 w-4" />
            Thay đổi trạng thái
          </Button>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
    refetchOrigins();
    refetchUnits();
  };

  const statusOptions = [
    { value: KEY_EMPTY_SELECT, label: "Tất cả trạng thái" },
    { value: "1", label: "Còn hàng" },
    { value: "0", label: "Hết hàng" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý nguyên liệu
          </h2>
          <p className="text-muted-foreground">Quản lý thông tin nguyên liệu </p>
        </div>

        <CreateMaterialForm />
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onRefresh={handleRefresh}
            refreshing={isFetching}
          >
            <ToolbarFilters
              filters={[
                {
                  placeholder: "Lọc theo xuất xứ",
                  value: filterOrigin,
                  onChange: setFilterOrigin,
                  options: [
                    { value: KEY_EMPTY_SELECT, label: "Tất cả xuất xứ" },
                    ...(origins?.data ?? []),
                  ],
                },
                {
                  placeholder: "Lọc theo đơn vị",
                  value: filterUnit,
                  onChange: setFilterUnit,
                  options: [
                    { value: KEY_EMPTY_SELECT, label: "Tất cả đơn vị" },
                    ...(units?.data ?? []),
                  ],
                },
                {
                  placeholder: "Lọc theo trạng thái",
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: statusOptions,
                },
              ]}
            />

          </TableToolbar>

          <DataTable<MaterialType>
            data={materials?.data}
            columns={columns}
            loading={isFetching}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <MaterialForm
              material={editForm}
              isDialogOpen={isEditDialogOpen}
              onClose={handleCloseEditDialog}
            />
          )}

          {toggleStatusForm && (
            <ToggleStatusMaterialDialog
              changeStatusMaterial={toggleStatusForm}
              setChangeStatusMaterial={setToggleStatusForm}
            />
          )}

          {isImageDialogOpen && (
            <ImageDialog
              isImageDialogOpen={isImageDialogOpen}
              images={images}
              onClose={handleCloseImageDialog}
              nameImage={nameImage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
