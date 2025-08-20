"use client";

import { AddMaterialDialog } from "./add-material-dialog";
import { CreateMaterialDialog } from "./create-material-dialog";
import { MaterialTable } from "./material-table";

export function MaterialSelector() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col">
        <div className="flex gap-2">
          <AddMaterialDialog />
        </div>
        <MaterialTable />
      </div>
    </div>
  );
}
