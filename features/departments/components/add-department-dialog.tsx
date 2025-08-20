import { CreateDepartmentForm } from "./create-department-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { BaseDialog } from "@/components/dialog";

export const AddDepartmentDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo phòng ban
      </Button>

      <BaseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Tạo phòng ban mới"
        description="Điền thông tin để tạo phòng ban mới. Nhấn nút Tạo phòng ban khi hoàn tất."
      >
        <CreateDepartmentForm
          onDepartmentAdded={() => setIsDialogOpen(false)}
        />
      </BaseDialog>
    </>
  );
};
