import React from "react";
import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMaterialRequestMutation } from "@/features/requests/hooks/useRequest";
import {
  CreateRequestAndMaterialInput,
  CreateRequestAndMaterialSchema,
} from "@/features/requests/schema/material-request-schema";
import { priorityOptions } from "@/features/requests/options";
import { SourceEnum, PriorityEnum } from "@/features/requests/constants";

// Options cho các select
const sourceOptions = [
  { value: SourceEnum.CUSTOMER, label: "Khách hàng" },
  { value: SourceEnum.OTHER, label: "Khác" },
];

const materialTypeOptions = [
  { value: "INGREDIENT", label: "Nguyên liệu" },
  { value: "ACCESSORY", label: "Phụ kiện" },
];

const materialStatusOptions = [
  { value: "AVAILABLE_IN_STOCK", label: "Có sẵn trong kho" },
  { value: "SENDING_REQUEST", label: "Đang gửi yêu cầu" },
  { value: "CANCELLED", label: "Đã hủy" },
];

interface MaterialRequestModalProps {
  open: boolean;
  onClose: () => void;
  currentRequest?: {
    source: string;
    priority: string;
    customerId: number;
    statusProductId: number;
  };
  currentUser?: {
    id: number;
  };
}

export const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({
  open,
  onClose,
  currentRequest,
  currentUser,
}) => {
  const { mutate, isPending } = useCreateMaterialRequestMutation();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRequestAndMaterialInput>({
    resolver: zodResolver(CreateRequestAndMaterialSchema),
    defaultValues: {
      requestData: {
        title: "",
        description: "",
        productLink: [],
        media: [],
        source: (currentRequest?.source as SourceEnum) ?? SourceEnum.OTHER,
        priority: (currentRequest?.priority as any) ?? PriorityEnum.NORMAL,
        createdById: currentUser?.id,
        customerId: currentRequest?.customerId,
        statusProductId: currentRequest?.statusProductId,
      },
      materialsData: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materialsData",
  });

  const handleFormSubmit: SubmitHandler<CreateRequestAndMaterialInput> = (
    data
  ) => {
    // Validate materials array
    if (data.materialsData.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nguyên vật liệu",
        variant: "destructive",
      });
      return;
    }

    // Check if all materials have required fields
    const hasEmptyFields = data.materialsData.some(
      (material) =>
        !material.name.trim() || material.quantity <= 0 || !material.unit.trim()
    );

    if (hasEmptyFields) {
      toast({
        title: "Lỗi",
        description:
          "Vui lòng điền đầy đủ thông tin cho tất cả nguyên vật liệu",
        variant: "destructive",
      });
      return;
    }

    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Yêu cầu mua nguyên vật liệu đã được tạo thành công",
        });
        handleClose();
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi tạo yêu cầu",
          variant: "destructive",
        });
      },
    });
  };

  const handleAddMaterial = () => {
    append({
      name: "",
      quantity: 1,
      unit: "cái",
      description: "",
      image: [],
      type: "INGREDIENT",
      status: "SENDING_REQUEST",
      originId: 1,
      requestInput: {
        quantity: 1,
        expectedDate: new Date().toISOString(),
        supplier: "",
        sourceCountry: "",
        price: 0,
        reason: "",
      },
    });
  };

  const handleRemoveMaterial = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: "Thông báo",
        description: "Phải có ít nhất một nguyên vật liệu",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Yêu cầu mua nguyên vật liệu"
      description="Điền thông tin để tạo yêu cầu mua nguyên vật liệu mới"
      contentClassName="w-[90vw] max-w-[1000px]"
    >
      <ScrollArea className="max-h-[80vh] pr-4">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-medium mb-4 col-span-full flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Thông tin yêu cầu
            </h3>

            <InputCustom
              control={control}
              name="requestData.title"
              label="Tiêu đề yêu cầu"
              placeholder="Nhập tiêu đề yêu cầu"
              required
            />

            <div className="col-span-full">
              <TextAreaCustom
                control={control}
                name="requestData.description"
                label="Mô tả yêu cầu"
                placeholder="Nhập mô tả chi tiết về yêu cầu"
                rows={3}
              />
            </div>

            <SelectCustom
              control={control}
              name="requestData.priority"
              label="Độ ưu tiên"
              options={priorityOptions}
              required
              disabled={!!currentRequest?.priority}
            />

            <SelectCustom
              control={control}
              name="requestData.source"
              label="Nguồn yêu cầu"
              options={sourceOptions}
              required
              disabled={!!currentRequest?.source}
            />
          </div>

          {/* Danh sách nguyên vật liệu */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                Danh sách nguyên vật liệu
                <Badge variant="outline" className="text-xs">
                  {fields.length} vật liệu
                </Badge>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMaterial}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm nguyên vật liệu
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg bg-card space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm">
                    Nguyên vật liệu #{index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMaterial(index)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputCustom
                    control={control}
                    name={`materialsData.${index}.name`}
                    label="Tên nguyên vật liệu"
                    placeholder="Nhập tên nguyên vật liệu"
                    required
                  />

                  <InputCustom
                    control={control}
                    name={`materialsData.${index}.quantity`}
                    label="Số lượng"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Nhập số lượng"
                    required
                  />

                  <InputCustom
                    control={control}
                    name={`materialsData.${index}.unit`}
                    label="Đơn vị"
                    placeholder="Nhập đơn vị"
                    required
                  />

                  <SelectCustom
                    control={control}
                    name={`materialsData.${index}.type`}
                    label="Loại nguyên vật liệu"
                    options={materialTypeOptions}
                    required
                  />

                  <SelectCustom
                    control={control}
                    name={`materialsData.${index}.status`}
                    label="Trạng thái"
                    options={materialStatusOptions}
                    required
                  />

                  <InputCustom
                    disabled
                    control={control}
                    name={`materialsData.${index}.originId`}
                    label="ID nguồn gốc"
                    type="number"
                    min={1}
                    placeholder="Nhập ID nguồn gốc"
                    required
                  />

                  <div className="md:col-span-3">
                    <TextAreaCustom
                      control={control}
                      name={`materialsData.${index}.description`}
                      label="Mô tả nguyên vật liệu"
                      placeholder="Nhập mô tả chi tiết về nguyên vật liệu"
                      rows={3}
                    />
                  </div>

                  <InputCustom
                    control={control}
                    name={`materialsData.${index}.price`}
                    label="Giá (VNĐ)"
                    type="number"
                    min={0}
                    placeholder="Nhập giá"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Tạo yêu cầu
                </>
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </BaseDialog>
  );
};
