"use client"

import { useState } from "react"
import { MaterialContextProvider } from "@/components/materials/material-context-firebase"
import { MaterialsTable } from "@/components/materials/materials-table"

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <MaterialContextProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý nguyên vật liệu</h1>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "list" ? "border-b-2 border-primary text-primary" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("list")}
          >
            Danh sách nguyên vật liệu
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "import" ? "border-b-2 border-primary text-primary" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("import")}
          >
            Đơn nhập nguyên vật liệu
          </button>
        </div>

        {activeTab === "list" ? (
          <MaterialsTable />
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium">Tính năng đang phát triển</h3>
            <p className="text-gray-500 mt-2">Chức năng quản lý đơn nhập nguyên vật liệu sẽ sớm được cập nhật.</p>
          </div>
        )}
      </div>
    </MaterialContextProvider>
  )
}
