import { ChangeEvent, Fragment, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BaseDialog } from "@/components/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { RequestInputType } from "../../schema";
import { MaterialType } from "@/features/materials/type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { MaterialList } from "./material-list";
import { SelectedMaterial } from "./selected-material";
import { useToast } from "@/hooks/use-toast";

export const AddMaterialDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchMaterial, setSearchMaterial] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [materialCount, setMaterialCount] = useState(1);
  const debouncedSearch = useDebounce(searchMaterial, 400);
  const { toast } = useToast();

  const { data: materials } = useMaterialsQuery({
    limit: 1000,
    page: 1,
    name: debouncedSearch,
  });

  const { control } = useFormContext<RequestInputType>();
  
  const { fields, append } = useFieldArray({
    control,
    name: "materials",
  });

  const selectedMaterial = materials?.data.find(
    (m) => m.id === selectedMaterialId
  );

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleMaterialSelect = (material: MaterialType) => {
    setSelectedMaterialId(material.id);
  };

  const handleSubmit = () => {
    if (selectedMaterialId) {
      // Kiểm tra xem vật liệu đã được thêm chưa
      const existingMaterial = fields.find(
        field => field.materialId === Number(selectedMaterialId)
      );
      
      if (existingMaterial) {
        toast({
          title: "Thông báo",
          description: "Vật liệu này đã được thêm vào danh sách",
          variant: "destructive",
        });
        return;
      }

      // Thêm vật liệu mới vào array
      append({
        materialId: Number(selectedMaterialId),
        quantity: materialCount,
      });
      
      toast({
        title: "Thành công",
        description: "Đã thêm vật liệu vào danh sách",
      });
      
      handleCloseDialog();
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setSelectedMaterialId(null);
    setMaterialCount(1);
    setSearchMaterial("");
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

  return (
    <Fragment>
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        onClick={handleOpenDialog}
      >
        <Plus className="h-4 w-4 mr-1" /> Thêm nguyên vật liệu
      </Button>

      <BaseDialog
        open={showDialog}
        onClose={handleCloseDialog}
        title="Thêm nguyên vật liệu"
        contentClassName="w-[600px] max-w-[800px]"
      >
        <Controller
          name="materials"
          control={control}
          render={() => (
            <div className="space-y-2">
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-1">
                  <div className="space-y-2 mb-4">
                    <Label>Tìm kiếm nguyên vật liệu</Label>
                    <Input
                      placeholder="Nhập tên nguyên vật liệu..."
                      onChange={(e) => setSearchMaterial(e.target.value)}
                      value={searchMaterial}
                    />
                  </div>
                  <ScrollArea className="max-h-[40vh] ">
                    <div className="flex flex-col gap-2 mb-4">
                      <MaterialList
                        materials={materials?.data || []}
                        selectedMaterialId={selectedMaterialId}
                        handleMaterialSelect={handleMaterialSelect}
                      />
                    </div>
                  </ScrollArea>
                </div>
              </ScrollArea>
            </div>
          )}
        />

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
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMaterialId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thêm nguyên vật liệu
          </Button>
        </div>
      </BaseDialog>
    </Fragment>
  );
};
