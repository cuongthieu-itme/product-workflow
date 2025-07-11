"use client";

import { useState } from "react";
import { MaterialList } from "./material-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessoryList } from "./accessory-list";

enum MATERIAL_TABS {
  MATERIAL = "material",
  ACCESSORY = "accessory",
}

enum MAIN_TABS {
  LIST = "list",
  IMPORT = "import",
}

export function MaterialsManager() {
  const [mainActiveTab, setMainActiveTab] = useState<MAIN_TABS>(MAIN_TABS.LIST);

  const [materialActiveTab, setMaterialActiveTab] = useState<MATERIAL_TABS>(
    MATERIAL_TABS.MATERIAL
  );

  const renderActiveTabClasses = (tab: MAIN_TABS) => {
    return `px-4 py-2 font-medium text-sm ${
      mainActiveTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-gray-500"
    }`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {mainActiveTab === MAIN_TABS.LIST
            ? "Danh sách nguyên vật liệu"
            : "Đơn nhập nguyên vật liệu"}
        </h1>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={renderActiveTabClasses(MAIN_TABS.LIST)}
          onClick={() => setMainActiveTab(MAIN_TABS.LIST)}
        >
          Danh sách nguyên vật liệu
        </button>
        <button
          className={renderActiveTabClasses(MAIN_TABS.IMPORT)}
          onClick={() => setMainActiveTab(MAIN_TABS.IMPORT)}
        >
          Đơn nhập nguyên vật liệu
        </button>
      </div>

      {mainActiveTab === MAIN_TABS.LIST ? (
        <Tabs
          value={materialActiveTab}
          onValueChange={(value) =>
            setMaterialActiveTab(value as MATERIAL_TABS)
          }
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value={MATERIAL_TABS.MATERIAL}>
              Nguyên liệu
            </TabsTrigger>
            <TabsTrigger value={MATERIAL_TABS.ACCESSORY}>Phụ kiện</TabsTrigger>
          </TabsList>

          <TabsContent value={MATERIAL_TABS.MATERIAL}>
            <MaterialList />
          </TabsContent>

          <TabsContent value={MATERIAL_TABS.ACCESSORY}>
            <AccessoryList />
          </TabsContent>
        </Tabs>
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
