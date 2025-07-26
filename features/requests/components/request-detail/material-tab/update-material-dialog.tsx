import { ChangeEvent, Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { BaseDialog } from "@/components/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RequestDetail, RequestMaterial } from "@/features/requests/type";
import { useAddMaterialToRequestMutation } from "@/features/requests/hooks/useRequest";
import { Badge } from "@/components/ui/badge";
import { MaterialEnum } from "@/features/materials/constants";

interface UpdateMaterialDialogProps {
  request?: RequestDetail;
  material: RequestMaterial;
}

export const UpdateMaterialDialog = ({ request, material }: UpdateMaterialDialogProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [materialCount, setMaterialCount] = useState(material.quantity || 1);
  const { toast } = useToast();

  const { mutate: addMaterialToRequest } = useAddMaterialToRequestMutation();

  const handleOpenDialog = () => {
    setMaterialCount(material.quantity || 1);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleSubmit = () => {
    if (!request) return;
    if (!material.id || !request) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật nguyên vật liệu.",
        variant: "destructive",
      });
      return;
    }

    addMaterialToRequest(
      {
        id: request.id,
        materialId: material.material.id,
        quantity: materialCount,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Đã cập nhật số lượng nguyên vật liệu!",
          });
          handleCloseDialog();
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description:
              "Không thể cập nhật nguyên vật liệu, vui lòng thử lại sau.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Tách logic xử lý thành một function riêng
  const handleMaterialCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const count = value ? parseInt(value, 10) : 1;

    // Kiểm tra giá trị không hợp lệ
    if (isNaN(count) || count < 1) {
      setMaterialCount(1);
      return;
    }

    // Kiểm tra vượt quá số lượng có sẵn
    const maxQuantity = material.material.quantity;
    if (maxQuantity && count > maxQuantity) {
      setMaterialCount(maxQuantity);
      toast({
        title: "Thông báo",
        description: `Số lượng không thể vượt quá ${maxQuantity}`,
        variant: "default",
      });
    } else {
      setMaterialCount(count);
    }
  };

  return (
    <Fragment>
      <Button 
        type="button" 
        size="sm"
        variant="outline"
        className="h-8"
        onClick={handleOpenDialog}
      >
        <Edit className="h-4 w-4 mr-1" /> Cập nhật
      </Button>

      <BaseDialog
        open={showDialog}
        onClose={handleCloseDialog}
        title="Cập nhật số lượng"
        description={`Cập nhật số lượng cho ${material.material.name}`}
        contentClassName="w-[500px]"
      >
        {/* Thông tin nguyên vật liệu */}
        <div className="border rounded-md p-4 mb-4 bg-muted/20">
          <div className="flex items-start gap-2 mb-2">
            <h5 className="font-medium">{material.material.name}</h5>
            <Badge variant="outline">{material.material.code}</Badge>
            <Badge
              variant={
                material.material.type === MaterialEnum.MATERIAL
                  ? "default"
                  : "secondary"
              }
              className="ml-auto"
            >
              {material.material.type === MaterialEnum.MATERIAL
                ? "Vật liệu"
                : "Phụ kiện"}
            </Badge>
          </div>
          
          {material.material.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {material.material.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Đơn vị:</span>
              <span className="font-medium">{material.material.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Kho:</span>
              <span className="font-medium">
                {material.material.quantity || 0} {material.material.unit}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="quantity">Số lượng</Label>
          <Input
            id="quantity"
            placeholder="Nhập số lượng..."
            onChange={handleMaterialCountChange}
            value={materialCount}
            type="number"
            min="1"
            max={material.material.quantity}
          />
          <p className="text-xs text-muted-foreground">
            Số lượng hiện tại: {material.quantity}, Kho: {material.material.quantity} {material.material.unit}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={materialCount === material.quantity}
          >
            Cập nhật
          </Button>
        </div>
      </BaseDialog>
    </Fragment>
  );
};
