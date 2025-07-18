"use client";

import { AddMaterialDialog } from "./add-material-dialog";
import { CreateMaterialDialog } from "./create-material-dialog";

export function MaterialSelector() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <AddMaterialDialog />

          <CreateMaterialDialog />
        </div>
      </div>
    </div>
  );
}
