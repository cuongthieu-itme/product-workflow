import { CreateCustomerForm } from "./create-customer-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { BaseDialog } from "@/components/dialog";

export const AddCustomerDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo khách hàng
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo khách hàng mới"
        description="Điền thông tin để tạo khách hàng mới. Nhấn nút Tạo khách hàng khi hoàn tất."
        contentClassName="sm:max-w-[400px]"
      >
        <CreateCustomerForm onCustomerAdded={() => setIsDialogOpen(false)} />
      </BaseDialog>
    </>
  );
};
