import { ChangeEvent, Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BaseDialog } from "@/components/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { MaterialType } from "@/features/materials/type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { SelectedMaterial } from "@/features/requests/form/material/selected-material";
import { RequestDetail } from "@/features/requests/type";
import { MaterialList } from "@/features/requests/form/material/material-list";
import { useAddMaterialToRequestMutation } from "@/features/requests/hooks/useRequest";

interface AddMaterialDialogProps {
  request?: RequestDetail;
}

export const AddMaterialDialog = ({ request }: AddMaterialDialogProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchMaterial, setSearchMaterial] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const [materialCount, setMaterialCount] = useState(1);
  const debouncedSearch = useDebounce(searchMaterial, 400);
  const { toast } = useToast();

  const { mutate: addMaterialToRequest } = useAddMaterialToRequestMutation();

  const { data: materials } = useMaterialsQuery({
    limit: 1000,
    page: 1,
    name: debouncedSearch,
  });

  const selectedMaterial = materials?.data.find(
    (m) => m.id === selectedMaterialId
  );

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleMaterialSelect = (material: MaterialType) => {
    setSelectedMaterialId(material.id);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedMaterialId(null);
    setMaterialCount(1);
    setSearchMaterial("");
  };

  const handleSubmit = () => {
    if (!request) return;
    if (!selectedMaterialId || !request) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nguyên vật liệu và yêu cầu.",
        variant: "destructive",
      });
      return;
    }

    addMaterialToRequest(
      {
        id: request?.id,
        materialId: selectedMaterialId,
        quantity: materialCount,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Đã thêm nguyên vật liệu vào yêu cầu!",
          });
          handleCloseDialog();
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description:
              "Không thể thêm nguyên vật liệu, vui lòng thử lại sau.",
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
    const maxQuantity = selectedMaterial?.quantity;
    if (maxQuantity && count > maxQuantity) {
      setMaterialCount(maxQuantity);
    } else {
      setMaterialCount(count);
    }
  };

  // Lọc ra các nguyên vật liệu chưa được thêm vào yêu cầu
  const materialList = materials?.data.filter(
    (material) =>
      !request?.requestMaterials.some(
        (m) => Number(m.material.id) === Number(material.id)
      )
  );

  return (
    <Fragment>
      <Button type="button" className="shrink-0" onClick={handleOpenDialog}>
        <Plus className="h-4 w-4 mr-1" /> Thêm nguyên vật liệu
      </Button>

      <BaseDialog
        open={showDialog}
        onClose={handleCloseDialog}
        title="Thêm nguyên vật liệu"
        description={`${
          materialList?.length || 0
        } nguyên vật liệu có sẵn để thêm`}
        contentClassName="w-[600px] max-w-[800px]"
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="space-y-2 mb-4">
              <Label>Tìm kiếm nguyên vật liệu</Label>
              <Input
                placeholder="Nhập tên nguyên vật liệu..."
                onChange={(e) => setSearchMaterial(e.target.value)}
                value={searchMaterial}
              />
            </div>
            <ScrollArea className="max-h-[200px] overflow-y-auto py-2">
              <div className="flex flex-col gap-2">
                {materialList && materialList.length > 0 ? (
                  <MaterialList
                    materials={materialList}
                    selectedMaterialId={selectedMaterialId}
                    handleMaterialSelect={handleMaterialSelect}
                  />
                ) : (
                  <div className="text-center p-4 text-sm text-muted-foreground">
                    {debouncedSearch
                      ? "Không tìm thấy nguyên vật liệu phù hợp"
                      : "Tất cả nguyên vật liệu đã được thêm vào yêu cầu này"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <SelectedMaterial
          materialCount={materialCount}
          selectedMaterial={selectedMaterial}
        />

        <div className="space-y-2 mb-4">
          <Label>Nhập số lượng</Label>
          <Input
            placeholder="Nhập số lượng..."
            onChange={handleMaterialCountChange}
            value={materialCount}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedMaterialId || !(materialList && materialList.length > 0)
            }
          >
            Thêm nguyên vật liệu
          </Button>
        </div>
      </BaseDialog>
    </Fragment>
  );
};
