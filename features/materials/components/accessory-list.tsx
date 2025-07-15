import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Power, Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AccessoryForm, CreateAccessoryForm } from "./accessory-form";
import { AccessoryType } from "../type";
import { useAccessoriesQuery } from "../hooks/useAccessories";
import { LIMIT, PAGE } from "@/constants/pagination";
import { getImageUrl } from "@/features/settings/utils";
import { ImageDialog } from "./image-dialog";
import { ToggleStatusAccessoryDialog } from "./toggle-status-accessory-dialog";
import { DeleteAccessoryDialog } from "./delete-accessory-dialog";

export const AccessoryList = () => {
  const [selectedAccessory, setSelectedAccessory] =
    useState<AccessoryType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingAccessory, setDeletingAccessory] =
    useState<AccessoryType | null>(null);
  const [toggleStatusForm, setToggleStatusForm] =
    useState<AccessoryType | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [nameImage, setNameImage] = useState<string>("");

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedAccessory(null);
  };

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

  const handleToggleStatus = async (accessory: AccessoryType) => {
    setToggleStatusForm(accessory);
  };

  const handleDeleteAccessory = async (accessory: AccessoryType) => {
    setDeletingAccessory(accessory);
  };

  const { data: accessories } = useAccessoriesQuery({
    limit: LIMIT,
    page: PAGE,
  });

  return (
    <div>
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý phụ kiện
          </h2>
          <p className="text-muted-foreground">Quản lý thông tin phụ kiện </p>
        </div>

        <CreateAccessoryForm />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
        {accessories?.data.length === 0 ? (
          <div className="py-6 col-span-full flex flex-col items-center justify-center text-gray-500 border border-dashed rounded-lg">
            <Package className="h-12 w-12 mb-3 opacity-60" />
            <p className="text-sm">Không có dữ liệu phụ kiện</p>
          </div>
        ) : (
          accessories?.data.map((accessory) => (
            <div
              key={accessory.id}
              className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div
                className="relative h-48 w-full cursor-pointer overflow-hidden"
                onClick={() => setSelectedAccessory(accessory)}
              >
                <Image
                  onClick={() => {
                    handleOpenImageDialog(accessory.image, accessory.name);
                  }}
                  src={getImageUrl(accessory.image[0]) || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-contain transition-transform duration-300 hover:scale-110"
                />
                <Badge
                  className="absolute top-2 right-2"
                  variant={accessory.isActive ? "default" : "destructive"}
                >
                  {accessory.isActive ? "Còn hàng" : "Hết hàng"}
                </Badge>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-lg truncate text-gray-900">
                  {accessory.name}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {accessory.code}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm">SL: {accessory.quantity ?? 0}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedAccessory(accessory);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        handleDeleteAccessory(accessory);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        handleToggleStatus(accessory);
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

      {selectedAccessory && (
        <AccessoryForm
          accessory={selectedAccessory}
          isDialogOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
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

      {toggleStatusForm && (
        <ToggleStatusAccessoryDialog
          changeStatusAccessory={toggleStatusForm}
          setChangeStatusAccessory={setToggleStatusForm}
        />
      )}

      {deletingAccessory && (
        <DeleteAccessoryDialog
          deletingAccessory={deletingAccessory}
          setDeletingAccessory={setDeletingAccessory}
        />
      )}
    </div>
  );
};
