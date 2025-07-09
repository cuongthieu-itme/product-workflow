"use client";

import { DepartmentList } from "./departments-list";
import { AddDepartmentDialog } from "./add-department-dialog";

export const DepartmentPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý phòng ban
          </h2>
          <p className="text-muted-foreground">
            Quản lý các phòng ban trong hệ thống, phân quyền và phân công nhân
            sự.
          </p>
        </div>

        <AddDepartmentDialog />
      </div>

      <div className="space-y-4">
        <DepartmentList />
      </div>
    </div>
  );
};
