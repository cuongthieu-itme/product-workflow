import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { InputCustom } from "@/components/form/input";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RequestInputType } from "../schema";

export const ProductLinks = () => {
  const { control } = useFormContext<RequestInputType>();
  const { fields, append, remove } = useFieldArray<RequestInputType>({
    control,
    name: "productLink",
  });

  const addReferenceLink = () => {
    append({ url: "" });
  };

  const removeReferenceLink = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Link sản phẩm tham khảo</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addReferenceLink}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Thêm link
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 w-full">
            <InputCustom
              name={`productLink.${index}.url`}
              control={control}
              placeholder={`Nhập link sản phẩm tham khảo ${
                index > 0 ? `số ${index + 1}` : "(nếu có)"
              }`}
              className="flex-1 w-full"
              containerClassName="flex-1"
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeReferenceLink(index)}
                className="px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {fields.filter((field) => field.id.trim() !== "").length > 0 && (
        <div className="text-xs text-muted-foreground">
          Đã có {fields.filter((field) => field.id.trim() !== "").length} link
          sản phẩm tham khảo
        </div>
      )}
    </div>
  );
};
