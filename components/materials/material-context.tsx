'use client'

import type React from 'react'

import { createContext, useContext, useState } from 'react'

// Định nghĩa kiểu dữ liệu
export interface Material {
  id: string
  name: string
  code: string
  quantity: number
  unit: string
  description?: string
  origin: string
  images: string[]
  isActive: boolean
  importPrice?: number
  minQuantity?: number
}

export interface MaterialRequest {
  id: string
  materialId: string
  materialName: string
  quantity: number
  expectedDate: string
  supplier?: string
  status: 'pending' | 'approved' | 'completed' | 'delayed'
  reason?: string
  sourceCountry?: string
  importPrice?: number
  requestCode?: string
  createdAt: Date
  updatedAt: Date
}

interface MaterialContextType {
  materials: Material[]
  materialRequests: MaterialRequest[]
  loading: boolean
  error: string | null
  addMaterial: (material: Omit<Material, 'id' | 'isActive'>) => Promise<string>
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
  toggleMaterialStatus: (id: string) => Promise<void>
  addMaterialRequest: (
    request: Omit<
      MaterialRequest,
      'id' | 'materialName' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<string>
  updateMaterialRequest: (
    id: string,
    request: Partial<MaterialRequest>
  ) => Promise<void>
  deleteMaterialRequest: (id: string) => Promise<void>
  updateRequestStatus: (
    id: string,
    status: MaterialRequest['status'],
    reason?: string
  ) => Promise<void>
  getMaterialById: (id: string) => Promise<Material | undefined>
  getMaterialRequestById: (id: string) => Promise<MaterialRequest | undefined>
  getMaterialRequestsByMaterialId: (
    materialId: string
  ) => Promise<MaterialRequest[]>
  updateMaterialQuantity: (
    materialId: string,
    quantity: number,
    isAddition?: boolean
  ) => Promise<void>
  refreshData: () => Promise<void>
}

const MaterialContext = createContext<MaterialContextType | undefined>(
  undefined
)

// Đổi tên từ MaterialProvider sang MaterialContextProvider để phù hợp với import
export function MaterialContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'Nhôm thanh',
      code: 'NL001',
      quantity: 500,
      unit: 'kg',
      description: 'Nhôm thanh dùng cho khung cửa',
      origin: 'Việt Nam',
      images: ['/nhom-structure.png'],
      isActive: true,
      importPrice: 120000,
      minQuantity: 100
    },
    {
      id: '2',
      name: 'Kính cường lực',
      code: 'NL002',
      quantity: 200,
      unit: 'm²',
      description: 'Kính cường lực 10mm',
      origin: 'Trung Quốc',
      images: [],
      isActive: true,
      importPrice: 350000,
      minQuantity: 50
    },
    {
      id: '3',
      name: 'Gỗ sồi',
      code: 'NL003',
      quantity: 300,
      unit: 'm³',
      description: 'Gỗ sồi tự nhiên',
      origin: 'Mỹ',
      images: ['/go-soi.png'],
      isActive: true,
      importPrice: 15000000,
      minQuantity: 10
    }
  ])
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock functions for development
  const addMaterial = async (material: Omit<Material, 'id' | 'isActive'>) => {
    const newMaterial = {
      id: `${materials.length + 1}`,
      ...material,
      isActive: true
    }
    setMaterials([...materials, newMaterial])
    return newMaterial.id
  }

  const updateMaterial = async (id: string, material: Partial<Material>) => {
    setMaterials(
      materials.map((item) =>
        item.id === id ? { ...item, ...material } : item
      )
    )
  }

  const deleteMaterial = async (id: string) => {
    setMaterials(materials.filter((item) => item.id !== id))
  }

  const toggleMaterialStatus = async (id: string) => {
    setMaterials(
      materials.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    )
  }

  const addMaterialRequest = async (
    request: Omit<
      MaterialRequest,
      'id' | 'materialName' | 'createdAt' | 'updatedAt'
    >
  ) => {
    const material = materials.find((m) => m.id === request.materialId)
    if (!material) throw new Error('Material not found')

    const newRequest = {
      id: `${materialRequests.length + 1}`,
      materialName: material.name,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setMaterialRequests([...materialRequests, newRequest])
    return newRequest.id
  }

  const updateMaterialRequest = async (
    id: string,
    request: Partial<MaterialRequest>
  ) => {
    setMaterialRequests(
      materialRequests.map((item) =>
        item.id === id ? { ...item, ...request, updatedAt: new Date() } : item
      )
    )
  }

  const deleteMaterialRequest = async (id: string) => {
    setMaterialRequests(materialRequests.filter((item) => item.id !== id))
  }

  const updateRequestStatus = async (
    id: string,
    status: MaterialRequest['status'],
    reason?: string
  ) => {
    setMaterialRequests(
      materialRequests.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, status, updatedAt: new Date() }
          if (reason && status === 'delayed') {
            updatedItem.reason = reason
          }
          return updatedItem
        }
        return item
      })
    )

    if (status === 'completed') {
      const request = materialRequests.find((r) => r.id === id)
      if (request) {
        const material = materials.find((m) => m.id === request.materialId)
        if (material) {
          updateMaterial(material.id, {
            quantity: material.quantity + request.quantity
          })
        }
      }
    }
  }

  const getMaterialById = async (id: string) => {
    return materials.find((m) => m.id === id)
  }

  const getMaterialRequestById = async (id: string) => {
    return materialRequests.find((r) => r.id === id)
  }

  const getMaterialRequestsByMaterialId = async (materialId: string) => {
    return materialRequests.filter((r) => r.materialId === materialId)
  }

  const updateMaterialQuantity = async (
    materialId: string,
    quantity: number,
    isAddition = true
  ) => {
    const material = materials.find((m) => m.id === materialId)
    if (!material) throw new Error('Material not found')

    const newQuantity = isAddition ? material.quantity + quantity : quantity
    updateMaterial(materialId, { quantity: newQuantity })
  }

  const refreshData = async () => {
    // Mock refresh function
  }

  const value = {
    materials,
    materialRequests,
    loading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialStatus,
    addMaterialRequest,
    updateMaterialRequest,
    deleteMaterialRequest,
    updateRequestStatus,
    getMaterialById,
    getMaterialRequestById,
    getMaterialRequestsByMaterialId,
    updateMaterialQuantity,
    refreshData
  }

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  )
}

// Giữ lại tên cũ để tương thích ngược
export const MaterialProvider = MaterialContextProvider

export function useMaterialContext() {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error(
      'useMaterialContext must be used within a MaterialContextProvider'
    )
  }
  return context
}
