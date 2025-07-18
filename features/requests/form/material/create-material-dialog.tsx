import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { openMaterialDialogAtom } from "../../requestAtom";
import { useSetAtom } from "jotai";

export const CreateMaterialDialog = () => {
  const setOpen = useSetAtom(openMaterialDialogAtom);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="shrink-0"
      onClick={handleOpenDialog}
    >
      <Plus className="h-4 w-4 mr-1" /> Thêm mới nguyên vật liệu
    </Button>
  );
};
