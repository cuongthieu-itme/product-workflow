import React from "react";
import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, ShoppingCart, Package, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMaterialRequestMutation } from "@/features/requests/hooks/useRequest";
import {
  CreateRequestAndMaterialInput,
  CreateRequestAndMaterialSchema,
} from "@/features/requests/schema/material-request-schema";
import { priorityOptions } from "@/features/requests/options";
import { SourceEnum, PriorityEnum } from "@/features/requests/constants";
import { MaterialEnum } from "@/features/materials/constants";
import { CreateMaterialModal } from "./create-material-modal";
import { CreateMaterialInputType } from "@/features/materials/schema";
import { RequestDetail } from "@/features/requests/type";

// Extended interface để xử lý productLink có thể là string hoặc array
interface ExtendedCreateRequestAndMaterialInput
  extends Omit<CreateRequestAndMaterialInput, "requestData"> {
  requestData: Omit<
    CreateRequestAndMaterialInput["requestData"],
    "productLink"
  > & {
    productLink?: string | string[];
  };
}

// Options cho các select
const sourceOptions = [
  { value: SourceEnum.CUSTOMER, label: "Khách hàng" },
  { value: SourceEnum.OTHER, label: "Khác" },
];

interface MaterialRequestModalProps {
  open: boolean;
  onClose: () => void;
  currentRequest?: RequestDetail;
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
  const [productLinks, setProductLinks] = React.useState<string[]>([""]);

  const { control, handleSubmit, reset } =
    useForm<CreateRequestAndMaterialInput>({
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
          customerId: currentRequest?.customer?.id,
        },
        materialsData: [],
        requestId: currentRequest?.id,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materialsData",
  });

  const handleFormSubmit: SubmitHandler<CreateRequestAndMaterialInput> = (
    data
  ) => {
    // Set productLinks từ state vào data
    data.requestData.productLink = productLinks.filter(
      (link) => link.trim() !== ""
    );

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

    mutate(
      {
        ...data,
        requestId: currentRequest?.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Yêu cầu mua nguyên vật liệu đã được tạo thành công",
          });
          handleClose();
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi tạo yêu cầu",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAddProductLink = () => {
    setProductLinks((prev) => [...prev, ""]);
  };

  const handleRemoveProductLink = (index: number) => {
    // Đảm bảo luôn có ít nhất 1 input
    if (productLinks.length > 1) {
      setProductLinks((prev) => prev.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Thông báo",
        description: "Phải có ít nhất một trường link sản phẩm",
        variant: "destructive",
      });
    }
  };

  const handleProductLinkChange = (index: number, value: string) => {
    setProductLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index] = value;
      return newLinks;
    });
  };

  const handleAddMaterial = (material: CreateMaterialInputType) => {
    append({
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      description: material.description || "",
      image: material.image || [],
      type: material.type,
      originId: material.originId,
      code: material.code,
      price: material.price,
      isActive: material.isActive ?? true,
    });
  };

  const handleRemoveMaterial = (index: number) => {
    remove(index);
    if (fields.length === 1) {
      toast({
        title: "Thông báo",
        description: "Đã xóa nguyên vật liệu cuối cùng",
      });
    }
  };

  const handleClose = () => {
    reset();
    setProductLinks([""]);
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
              className="w-full"
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

            <div className="col-span-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Link sản phẩm tham khảo
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddProductLink}
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm link
                  </Button>
                </div>

                <div className="space-y-2">
                  {productLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={link}
                          onChange={(e) =>
                            handleProductLinkChange(index, e.target.value)
                          }
                          placeholder={`Nhập link sản phẩm ${index + 1}`}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isPending}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveProductLink(index)}
                        disabled={isPending || productLinks.length <= 1}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SelectCustom
              control={control}
              name="requestData.priority"
              label="Độ ưu tiên"
              options={priorityOptions}
              required
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
                <Package className="w-5 h-5 text-primary" />
                Danh sách nguyên vật liệu
                <Badge variant="outline" className="text-xs">
                  {fields.length} vật liệu
                </Badge>
              </h3>
              <CreateMaterialModal onMaterialCreated={handleAddMaterial} />
            </div>

            {fields.length > 0 ? (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      Nguyên vật liệu #{index + 1}
                    </h4>
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
                  </div>

                  {/* Hiển thị thông tin material đã tạo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Tên nguyên vật liệu
                        </label>
                        {field.code && (
                          <Badge variant="outline" className="text-xs">
                            {field.code}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            field.type === MaterialEnum.MATERIAL
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {field.type === MaterialEnum.MATERIAL
                            ? "Nguyên liệu"
                            : "Phụ kiện"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {field.name || "Chưa có tên"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Số lượng
                      </label>
                      <p className="text-sm">
                        {field.quantity} {field.unit}
                      </p>
                    </div>

                    {field.price && field.price > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Giá dự kiến
                        </label>
                        <p className="text-sm font-medium">
                          {field.price?.toLocaleString()} VNĐ
                        </p>
                      </div>
                    )}

                    {field.description && (
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-xs font-medium text-muted-foreground">
                          Mô tả
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hidden inputs để lưu trữ dữ liệu cho React Hook Form */}
                  <div style={{ display: "none" }}>
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.name`}
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.quantity`}
                      type="number"
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.unit`}
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.type`}
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.originId`}
                      type="number"
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.code`}
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.price`}
                      type="number"
                    />
                    <InputCustom
                      control={control}
                      name={`materialsData.${index}.isActive`}
                      type="checkbox"
                    />
                    <TextAreaCustom
                      control={control}
                      name={`materialsData.${index}.description`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-2">
                  Chưa có nguyên vật liệu nào được thêm
                </p>
                <p className="text-sm text-muted-foreground">
                  Hãy nhấn "Thêm nguyên vật liệu" để bắt đầu
                </p>
              </div>
            )}
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
