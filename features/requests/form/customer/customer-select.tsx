import { SelectCustom } from "@/components/form";
import { Button } from "@/components/ui/button";
import { useCustomersQuery } from "@/features/customers/hooks";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { RequestInputType } from "../../schema";
import { useAtom, useSetAtom } from "jotai";
import { openCustomerFormDialogAtom } from "../../requestAtom";

export const CustomerSelect = () => {
  const { data: customer } = useCustomersQuery();
  const setOpenCustomerFormDialog = useSetAtom(openCustomerFormDialogAtom);
  const handleOpenCustomerFormDialog = () => {
    setOpenCustomerFormDialog(true);
  };

  const customerOptions =
    customer?.data.map((c) => ({
      value: c.id,
      label: c.fullName || c.email || "Khách hàng không xác định",
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
        name="customerId"
        label="Khách hàng"
        options={customerOptions}
        placeholder="Chọn khách hàng"
        required
        containerClassName="flex-1"
      />

      <Button
        onClick={handleOpenCustomerFormDialog}
        type="button"
        variant="outline"
        className={cn("shrink-0 mt-8", errors.customerId && "mb-2")}
      >
        <Plus className="h-4 w-4 mr-1" /> Thêm mới
      </Button>
    </div>
  );
};
