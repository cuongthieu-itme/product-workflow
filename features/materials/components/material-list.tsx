"use client";

import { useState } from "react";
import { TablePagination } from "@/components/data-table/pagination";
import { Edit, Package, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/data-table/toolbar";
import { LIMIT, PAGE } from "@/constants/pagination";
import { MaterialType } from "../type";
import Image from "next/image";
import { CreateMaterialForm } from "./material-form-dialog";
import { useMaterialsQuery } from "../hooks";
import { ToggleStatusMaterialDialog } from "./toggle-status-material-dialog";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/features/settings/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useOriginsQuery } from "../hooks/useMaterials";
import { KEY_EMPTY_SELECT } from "@/components/form/select";
import { ToolbarFilters } from "@/components/data-table/toolbar-filter";
import { ImageDialog } from "./image-dialog";
import { MaterialFormWithTabs } from "./material-form-with-tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialList() {
  const [page, setPage] = useState(PAGE);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [filterOrigin, setFilterOrigin] = useState(KEY_EMPTY_SELECT);
  const [filterStatus, setFilterStatus] = useState(KEY_EMPTY_SELECT);
  const {
    data: materials,
    isFetching,
    refetch,
  } = useMaterialsQuery({
    page,
    limit: LIMIT,
    name: debouncedSearchValue,
    origin: filterOrigin,
    isActive:
      filterStatus === KEY_EMPTY_SELECT
        ? undefined
        : Boolean(Number(filterStatus)),
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

  const handleRefresh = () => {
    refetch();
    refetchOrigins();
  };

  const statusOptions = [
    { value: KEY_EMPTY_SELECT, label: "Tất cả trạng thái" },
    { value: "1", label: "Còn hàng" },
    { value: "0", label: "Hết hàng" },
  ];

  const originOptions =
    origins?.data.map((origin) => ({
      value: origin.id,
      label: origin.name,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý nguyên liệu
          </h2>
          <p className="text-muted-foreground">
            Quản lý thông tin nguyên liệu{" "}
          </p>
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
                    ...originOptions,
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
            {isFetching ? (
              <div className="flex flex-row gap-6">
                <Skeleton className="h-24 w-24 mb-3 opacity-60" />
                <Skeleton className="h-24 w-24 mb-3 opacity-60" />
                <Skeleton className="h-24 w-24 mb-3 opacity-60" />
                <Skeleton className="h-24 w-24 mb-3 opacity-60" />
                <Skeleton className="h-24 w-24 mb-3 opacity-60" />
              </div>
            ) : materials?.data.length === 0 ? (
              <div className="py-6 col-span-full flex flex-col items-center justify-center text-gray-500 border border-dashed rounded-lg">
                <Package className="h-12 w-12 mb-3 opacity-60" />
                <p className="text-sm">Không có dữ liệu nguyên liệu</p>
                <p className="text-sm mt-2 text-gray-400">
                  Bạn có thể thêm nguyên liệu bằng cách nhấn nút "Thêm mới" ở
                  trên
                </p>
              </div>
            ) : (
              materials?.data.map((material) => (
                <div
                  key={material.id}
                  className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative h-48 w-full cursor-pointer overflow-hidden">
                    <Image
                      onClick={() => {
                        handleOpenImageDialog(material.image, material.name);
                      }}
                      src={getImageUrl(material.image[0]) || "/placeholder.svg"}
                      alt={material.name}
                      fill
                      className="object-contain transition-transform duration-300 hover:scale-110"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={material.isActive ? "default" : "destructive"}
                    >
                      {material.isActive ? "Còn hàng" : "Hết hàng"}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-lg truncate text-gray-900">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {material.code}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm">
                        SL: {material.quantity ?? 0}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleOpenEditDialog(material);
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleOpenChangeStatusDialog(material);
                          }}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {editForm && (
            <MaterialFormWithTabs
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
