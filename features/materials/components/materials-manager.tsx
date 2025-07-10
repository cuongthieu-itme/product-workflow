"use client";

import { useState } from "react";
import { MaterialsTable } from "@/components/materials/materials-table";
import { MaterialList } from "./material-list";

enum MATERIAL_TABS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

export function MaterialsManager() {
  const [activeTab, setActiveTab] = useState<MATERIAL_TABS>(MATERIAL_TABS.LIST);
  const renderActiveTabClasses = (tab: MATERIAL_TABS) => {
    return `px-4 py-2 font-medium text-sm ${
      activeTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-gray-500"
    }`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý nguyên vật liệu
        </h1>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={renderActiveTabClasses(MATERIAL_TABS.LIST)}
          onClick={() => setActiveTab(MATERIAL_TABS.LIST)}
        >
          Danh sách nguyên vật liệu
        </button>
        <button
          className={renderActiveTabClasses(MATERIAL_TABS.IMPORT)}
          onClick={() => setActiveTab(MATERIAL_TABS.IMPORT)}
        >
          Đơn nhập nguyên vật liệu
        </button>
      </div>

      {activeTab === MATERIAL_TABS.LIST ? (
        <MaterialList />
      ) : (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium">Tính năng đang phát triển</h3>
          <p className="text-gray-500 mt-2">
            Chức năng quản lý đơn nhập nguyên vật liệu sẽ sớm được cập nhật.
          </p>
        </div>
      )}
    </div>
  );
}
