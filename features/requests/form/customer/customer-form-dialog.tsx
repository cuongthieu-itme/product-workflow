import { BaseDialog } from "@/components/dialog";
import { CreateCustomerForm } from "@/features/customers/components/create-customer-form";
import { useAtom } from "jotai";
import { openCustomerFormDialogAtom } from "../../requestAtom";

export const CustomerFormDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useAtom(openCustomerFormDialogAtom);

  return (
    <BaseDialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      title="Tạo khách hàng mới"
      description="Điền thông tin để tạo khách hàng mới. Nhấn nút Tạo khách hàng khi hoàn tất."
    >
      <CreateCustomerForm onCustomerAdded={() => setIsDialogOpen(false)} />
    </BaseDialog>
  );
};
