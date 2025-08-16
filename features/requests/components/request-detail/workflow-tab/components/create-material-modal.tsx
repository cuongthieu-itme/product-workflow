import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { BaseDialog } from "@/components/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { UploadFile } from "@/components/common/upload";
import { useToast } from "@/components/ui/use-toast";
import { MaterialEnum } from "@/features/materials/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  useOriginsQuery,
  useUnitsQuery,
} from "@/features/materials/hooks/useMaterials";
import {
  createMaterialInputSchema,
  CreateMaterialInputType,
} from "@/features/materials/schema";

// Schema validation cho material mới - sử dụng schema có sẵn từ materials
// Thêm type select để phân biệt Material và Accessory
const materialTypeOptions = [
  { value: MaterialEnum.MATERIAL, label: "Nguyên liệu" },
  { value: MaterialEnum.ACCESSORY, label: "Phụ kiện" },
];

interface CreateMaterialModalProps {
  onMaterialCreated: (material: CreateMaterialInputType) => void;
}

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  onMaterialCreated,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialInputType>({
    resolver: zodResolver(createMaterialInputSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      description: "",
      type: MaterialEnum.MATERIAL,
      price: 0,
      originId: 0,
      code: "",
      image: [],
      isActive: true,
    },
  });

  // Lấy data cho select options
  const { data: origins } = useOriginsQuery();
  const { data: units } = useUnitsQuery();

  const originsOptions = origins?.data.map((origin) => ({
    value: origin.id,
    label: origin.name,
  }));

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    reset();
  };

  const handleFormSubmit: SubmitHandler<CreateMaterialInputType> = (data) => {
    // Validate required fields
    if (
      !data.name.trim() ||
      data.quantity <= 0 ||
      !data.unit.trim() ||
      !data.code.trim()
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Add the material to the array
    onMaterialCreated(data);

    toast({
      title: "Thành công",
      description: "Đã thêm nguyên vật liệu mới",
    });

    handleCloseDialog();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm nguyên vật liệu
      </Button>

      <BaseDialog
        open={showDialog}
        onClose={handleCloseDialog}
        title="Tạo nguyên liệu"
        description="Điền thông tin để tạo nguyên liệu mới. Nhấn nút Tạo nguyên liệu khi hoàn tất."
        contentClassName="sm:max-w-[800px]"
      >
        <ScrollArea className="max-h-[70vh] pr-4 -mr-4">
          <div className="space-y-6 pr-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-4">
                <UploadFile name="image" control={control} />

                <InputCustom
                  control={control}
                  name="name"
                  label="Tên nguyên liệu"
                  placeholder="Nhập tên nguyên liệu"
                  required
                />

                <TextAreaCustom
                  control={control}
                  name="description"
                  label="Chi tiết nguyên liệu"
                  placeholder="Nhập chi tiết nguyên liệu"
                />

                <InputCustom
                  control={control}
                  name="code"
                  label="Mã nguyên liệu"
                  placeholder="Nhập mã nguyên liệu"
                  required
                />

                <div className="flex gap-2 flex-row w-full justify-between">
                  <InputCustom
                    control={control}
                    name="unit"
                    label="Đơn vị"
                    placeholder="Nhập đơn vị"
                    required
                    className="w-full"
                    containerClassName="w-full"
                  />

                  <InputCustom
                    control={control}
                    name="quantity"
                    label="Số lượng"
                    placeholder="Nhập số lượng"
                    required
                    type="number"
                    containerClassName="w-full"
                    className="w-full"
                  />
                </div>

                <SelectCustom
                  options={originsOptions || []}
                  control={control}
                  name="originId"
                  label="Xuất xứ"
                  placeholder="Nhập xuất xứ"
                  required
                  valueType="number"
                />

                {/* Thêm select cho loại material */}
                <SelectCustom
                  options={materialTypeOptions}
                  control={control}
                  name="type"
                  label="Loại nguyên liệu"
                  placeholder="Chọn loại nguyên liệu"
                  required
                />

                {/* Thêm trường price tương tự như schema */}
                <InputCustom
                  control={control}
                  name="price"
                  label="Giá (VNĐ)"
                  placeholder="Nhập giá"
                  type="number"
                  min={0}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo nguyên liệu
                </Button>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </BaseDialog>
    </>
  );
};
