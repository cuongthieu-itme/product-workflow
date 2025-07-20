import { SelectCustom } from "@/components/form";
import { Button } from "@/components/ui/button";
import { useCustomersQuery } from "@/features/customers/hooks";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { RequestInputType } from "../../schema";
import { useSetAtom } from "jotai";
import { openSourceFormDialogAtom } from "../../requestAtom";
import { useGetSourceOthersQuery } from "../../hooks/useRequest";

export const SourceSelect = () => {
  const { data: sources } = useGetSourceOthersQuery({limit: 1000});
  const setOpenSourceFormDialog = useSetAtom(openSourceFormDialogAtom);
  const handleOpenSourceFormDialog = () => {
    setOpenSourceFormDialog(true);
  };

  const sourceOptions =
    sources?.map((s) => ({
      value: s.id,
      label: s.name || "Nguồn không xác định",
    })) || [];

  const {
    control,
    formState: { errors },
  } = useFormContext<RequestInputType>();

  return (
    <div className="flex items-center gap-2">
      <SelectCustom
        valueType="number"
        searchable
        control={control}
        name="sourceOtherId"
        label="Nguồn khác"
        options={sourceOptions}
        placeholder="Chọn nguồn khác"
        required
        containerClassName="flex-1"
      />

      <Button
        onClick={handleOpenSourceFormDialog}
        type="button"
        variant="outline"
        className={cn("shrink-0 mt-8", errors.customerId && "mb-2")}
      >
        <Plus className="h-4 w-4 mr-1" /> Thêm mới
      </Button>
    </div>
  );
};
