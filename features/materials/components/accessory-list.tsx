import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Power } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { accessoryMock } from "../mock/accessory-mock";

interface Accessory {
  id: string;
  name: string;
  code: string;
  quantity: number;
  isActive: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export const AccessoryList = () => {
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleDeleteAccessory = async (accessory: Accessory) => {
    // TODO: Implement delete functionality
    console.log("Deleting accessory:", accessory);
    setIsDeleteDialogOpen(false);
  };

  const handleToggleStatus = async (accessory: Accessory) => {
    // TODO: Implement status toggle functionality
    console.log("Toggling status for accessory:", accessory);
    setIsStatusDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {accessoryMock.length === 0 ? (
        <div className="col-span-full text-center py-8">
          Không có dữ liệu phụ kiện
        </div>
      ) : (
        accessoryMock.map((accessory) => (
          <div
            key={accessory.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="relative h-40 w-full cursor-pointer"
              onClick={() => setSelectedAccessory(accessory)}
            >
              <Image
                src={accessory.images[0] || "/placeholder.svg"}
                alt={accessory.name}
                fill
                className="object-cover"
              />
              <Badge
                className="absolute top-2 right-2"
                variant={accessory.isActive ? "default" : "destructive"}
              >
                {accessory.isActive ? "Còn hàng" : "Hết hàng"}
              </Badge>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-lg truncate">{accessory.name}</h3>
              <p className="text-sm text-gray-500 truncate">{accessory.code}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm">SL: {accessory.quantity}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedAccessory(accessory)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedAccessory(accessory);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedAccessory(accessory);
                      setIsStatusDialogOpen(true);
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
  );
};
