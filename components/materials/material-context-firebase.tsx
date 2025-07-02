"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  createdAt?: Date
  updatedAt?: Date
  type: "material" | "accessory" // Thêm trường type để phân loại
}

export interface MaterialRequest {
  id: string
  materialId: string
  materialName: string
  quantity: number
  expectedDate: string
  supplier?: string
  status: "pending" | "approved" | "completed" | "delayed"
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
  addMaterial: (material: Omit<Material, "id" | "isActive">) => Promise<string>
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
  toggleMaterialStatus: (id: string) => Promise<void>
  addMaterialRequest: (
    request: Omit<MaterialRequest, "id" | "materialName" | "createdAt" | "updatedAt">,
  ) => Promise<string>
  updateMaterialRequest: (id: string, request: Partial<MaterialRequest>) => Promise<void>
  deleteMaterialRequest: (id: string) => Promise<void>
  updateRequestStatus: (id: string, status: MaterialRequest["status"], reason?: string) => Promise<void>
  getMaterialById: (id: string) => Promise<Material | undefined>
  getMaterialRequestById: (id: string) => Promise<MaterialRequest | undefined>
  getMaterialRequestsByMaterialId: (materialId: string) => Promise<MaterialRequest[]>
  updateMaterialQuantity: (materialId: string, quantity: number, isAddition?: boolean) => Promise<void>
  refreshData: () => Promise<void>
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined)

// Chuyển đổi Firestore timestamp sang Date
const convertTimestampToDate = (data: any) => {
  if (!data) return data

  if (data instanceof Timestamp) {
    return data.toDate()
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => convertTimestampToDate(item))
    }

    const result: any = {}
    for (const key in data) {
      result[key] = convertTimestampToDate(data[key])
    }
    return result
  }

  return data
}

// Đổi tên từ MaterialProvider sang MaterialContextProvider để phù hợp với import
export function MaterialContextProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lấy dữ liệu từ Firebase khi component được mount
  useEffect(() => {
    fetchData()
  }, [])

  // Hàm lấy dữ liệu từ Firebase
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Lấy danh sách nguyên vật liệu
      const materialsRef = collection(db, "materials")
      const materialsSnapshot = await getDocs(materialsRef)
      const materialsData = materialsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          // Đảm bảo trường type luôn có giá trị, mặc định là "material"
          type: data.type || "material",
        }
      }) as Material[]

      setMaterials(materialsData)

      // Lấy danh sách yêu cầu nhập nguyên vật liệu
      const requestsRef = collection(db, "materialRequests")
      const requestsSnapshot = await getDocs(requestsRef)
      const requestsData = requestsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MaterialRequest
      })

      setMaterialRequests(requestsData)

      // Nếu không có dữ liệu, thêm dữ liệu mẫu
      if (materialsData.length === 0) {
        const sampleMaterials = [
          {
            name: "Nhôm thanh",
            code: "NL001",
            quantity: 500,
            unit: "kg",
            description: "Nhôm thanh dùng cho khung cửa",
            origin: "Việt Nam",
            images: ["/nhom-structure.png"],
            isActive: true,
            importPrice: 120000,
            minQuantity: 100,
            type: "material",
          },
          {
            name: "Kính cường lực",
            code: "NL002",
            quantity: 200,
            unit: "m²",
            description: "Kính cường lực 10mm",
            origin: "Trung Quốc",
            images: [],
            isActive: true,
            importPrice: 350000,
            minQuantity: 50,
            type: "material",
          },
          {
            name: "Gỗ sồi",
            code: "NL003",
            quantity: 300,
            unit: "m³",
            description: "Gỗ sồi tự nhiên",
            origin: "Mỹ",
            images: ["/go-soi.png"],
            isActive: true,
            importPrice: 15000000,
            minQuantity: 10,
            type: "material",
          },
          {
            name: "Tay nắm cửa inox",
            code: "PK001",
            quantity: 50,
            unit: "cái",
            description: "Tay nắm cửa inox cao cấp",
            origin: "Đài Loan",
            images: ["/placeholder.svg?height=200&width=200"],
            isActive: true,
            importPrice: 150000,
            minQuantity: 10,
            type: "accessory",
          },
          {
            name: "Bản lề cửa",
            code: "PK002",
            quantity: 100,
            unit: "bộ",
            description: "Bản lề cửa thép không gỉ",
            origin: "Việt Nam",
            images: ["/placeholder.svg?height=200&width=200"],
            isActive: true,
            importPrice: 75000,
            minQuantity: 20,
            type: "accessory",
          },
        ]

        for (const material of sampleMaterials) {
          await addDoc(collection(db, "materials"), material)
        }

        // Lấy lại dữ liệu sau khi thêm
        const updatedMaterialsSnapshot = await getDocs(materialsRef)
        const updatedMaterialsData = updatedMaterialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || "material", // Đảm bảo trường type luôn có giá trị
        })) as Material[]

        setMaterials(updatedMaterialsData)
      }
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu từ Firebase:", error)
      setError(`Lỗi khi tải dữ liệu: ${error.message}`)

      // Fallback to localStorage if Firebase fails
      try {
        const storedMaterials = localStorage.getItem("materials")
        if (storedMaterials) {
          setMaterials(JSON.parse(storedMaterials))
        }

        const storedRequests = localStorage.getItem("materialRequests")
        if (storedRequests) {
          setMaterialRequests(JSON.parse(storedRequests))
        }
      } catch (localError) {
        console.error("Lỗi khi đọc dữ liệu từ localStorage:", localError)
      }
    } finally {
      setLoading(false)
    }
  }

  // Thêm nguyên vật liệu mới
  const addMaterial = async (material: Omit<Material, "id" | "isActive">) => {
    try {
      const newMaterial = {
        ...material,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "materials"), newMaterial)

      const addedMaterial = {
        id: docRef.id,
        ...newMaterial,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setMaterials((prev) => [...prev, addedMaterial])

      return docRef.id
    } catch (error: any) {
      console.error("Lỗi khi thêm nguyên vật liệu:", error)
      setError(`Lỗi khi thêm nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Cập nhật thông tin nguyên vật liệu
  const updateMaterial = async (id: string, material: Partial<Material>) => {
    try {
      const materialRef = doc(db, "materials", id)

      const updateData = {
        ...material,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(materialRef, updateData)

      setMaterials((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...material, updatedAt: new Date() } : item)),
      )
    } catch (error: any) {
      console.error("Lỗi khi cập nhật nguyên vật liệu:", error)
      setError(`Lỗi khi cập nhật nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Xóa nguyên vật liệu
  const deleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, "materials", id))

      setMaterials((prev) => prev.filter((item) => item.id !== id))
    } catch (error: any) {
      console.error("Lỗi khi xóa nguyên vật liệu:", error)
      setError(`Lỗi khi xóa nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Bật/tắt trạng thái nguyên vật liệu
  const toggleMaterialStatus = async (id: string) => {
    try {
      const material = materials.find((item) => item.id === id)
      if (!material) return

      const materialRef = doc(db, "materials", id)
      await updateDoc(materialRef, {
        isActive: !material.isActive,
        updatedAt: serverTimestamp(),
      })

      setMaterials((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive, updatedAt: new Date() } : item)),
      )
    } catch (error: any) {
      console.error("Lỗi khi thay đổi trạng thái nguyên vật liệu:", error)
      setError(`Lỗi khi thay đổi trạng thái nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Thêm yêu cầu nhập nguyên vật liệu
  const addMaterialRequest = async (
    requestData: Omit<MaterialRequest, "id" | "materialName" | "createdAt" | "updatedAt">,
  ) => {
    try {
      // Kiểm tra xem yêu cầu đã tồn tại chưa để tránh trùng lặp
      const existingRequestsRef = collection(db, "materialRequests")
      const q = query(
        existingRequestsRef,
        where("materialId", "==", requestData.materialId),
        where("quantity", "==", requestData.quantity),
        where("expectedDate", "==", requestData.expectedDate),
      )

      const existingRequestsSnapshot = await getDocs(q)

      if (!existingRequestsSnapshot.empty) {
        console.log("Yêu cầu đã tồn tại, không tạo trùng lặp")
        return existingRequestsSnapshot.docs[0].id
      }

      // Lấy thông tin nguyên vật liệu
      const materialRef = doc(db, "materials", requestData.materialId)
      const materialSnap = await getDoc(materialRef)

      if (!materialSnap.exists()) {
        throw new Error("Không tìm thấy nguyên vật liệu")
      }

      const material = materialSnap.data() as Material

      // Tạo yêu cầu mới
      const newRequest = {
        materialId: requestData.materialId,
        materialName: material.name,
        quantity: requestData.quantity,
        expectedDate: requestData.expectedDate,
        supplier: requestData.supplier || "",
        status: requestData.status || "pending",
        reason: requestData.reason || "",
        sourceCountry: requestData.sourceCountry || material.origin,
        importPrice: requestData.importPrice || material.importPrice,
        requestCode: requestData.requestCode || `REQ-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "materialRequests"), newRequest)

      // Lấy dữ liệu vừa thêm
      const addedRequest = {
        id: docRef.id,
        ...newRequest,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as MaterialRequest

      setMaterialRequests((prev) => [...prev, addedRequest])

      return docRef.id
    } catch (error: any) {
      console.error("Lỗi khi thêm yêu cầu nhập nguyên vật liệu:", error)
      setError(`Lỗi khi thêm yêu cầu nhập nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Cập nhật yêu cầu nhập nguyên vật liệu
  const updateMaterialRequest = async (id: string, request: Partial<MaterialRequest>) => {
    try {
      const requestRef = doc(db, "materialRequests", id)

      const updateData = {
        ...request,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(requestRef, updateData)

      // Cập nhật state
      setMaterialRequests((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...request,
              updatedAt: new Date(),
            }
          }
          return item
        }),
      )
    } catch (error: any) {
      console.error("Lỗi khi cập nhật yêu cầu nhập nguyên vật liệu:", error)
      setError(`Lỗi khi cập nhật yêu cầu nhập nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Xóa yêu cầu nhập nguyên vật liệu
  const deleteMaterialRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "materialRequests", id))

      setMaterialRequests((prev) => prev.filter((item) => item.id !== id))
    } catch (error: any) {
      console.error("Lỗi khi xóa yêu cầu nhập nguyên vật liệu:", error)
      setError(`Lỗi khi xóa yêu cầu nhập nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Cập nhật trạng thái yêu cầu
  const updateRequestStatus = async (id: string, status: MaterialRequest["status"], reason?: string) => {
    try {
      const requestRef = doc(db, "materialRequests", id)
      const requestSnap = await getDoc(requestRef)

      if (!requestSnap.exists()) {
        throw new Error("Không tìm thấy yêu cầu")
      }

      const requestData = requestSnap.data() as MaterialRequest

      // Cập nhật dữ liệu
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      }

      // Nếu có lý do và trạng thái là delayed, cập nhật lý do
      if (reason && status === "delayed") {
        updateData.reason = reason
      }

      await updateDoc(requestRef, updateData)

      // Nếu trạng thái là completed, cập nhật số lượng nguyên vật liệu
      if (status === "completed") {
        const materialRef = doc(db, "materials", requestData.materialId)
        const materialSnap = await getDoc(materialRef)

        if (materialSnap.exists()) {
          const materialData = materialSnap.data() as Material
          await updateDoc(materialRef, {
            quantity: materialData.quantity + requestData.quantity,
          })

          // Cập nhật state materials
          setMaterials((prev) =>
            prev.map((material) => {
              if (material.id === requestData.materialId) {
                return {
                  ...material,
                  quantity: material.quantity + requestData.quantity,
                }
              }
              return material
            }),
          )
        }
      }

      // Cập nhật state materialRequests
      setMaterialRequests((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updatedItem = {
              ...item,
              status,
              updatedAt: new Date(),
            }

            if (reason && status === "delayed") {
              updatedItem.reason = reason
            }

            return updatedItem
          }
          return item
        }),
      )
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái yêu cầu:", error)
      setError(`Lỗi khi cập nhật trạng thái yêu cầu: ${error.message}`)
      throw error
    }
  }

  // Lấy nguyên vật liệu theo ID
  const getMaterialById = async (id: string) => {
    try {
      const materialRef = doc(db, "materials", id)
      const materialSnap = await getDoc(materialRef)

      if (!materialSnap.exists()) {
        return undefined
      }

      return {
        id: materialSnap.id,
        ...materialSnap.data(),
        type: materialSnap.data().type || "material", // Đảm bảo trường type luôn có giá trị
      } as Material
    } catch (error: any) {
      console.error("Lỗi khi lấy nguyên vật liệu theo ID:", error)
      setError(`Lỗi khi lấy nguyên vật liệu theo ID: ${error.message}`)
      return undefined
    }
  }

  // Lấy yêu cầu nhập nguyên vật liệu theo ID
  const getMaterialRequestById = async (id: string) => {
    try {
      const requestRef = doc(db, "materialRequests", id)
      const requestSnap = await getDoc(requestRef)

      if (!requestSnap.exists()) {
        return undefined
      }

      const data = requestSnap.data()

      return {
        id: requestSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MaterialRequest
    } catch (error: any) {
      console.error("Lỗi khi lấy yêu cầu nhập nguyên vật liệu theo ID:", error)
      setError(`Lỗi khi lấy yêu cầu nhập nguyên vật liệu theo ID: ${error.message}`)
      return undefined
    }
  }

  // Lấy tất cả yêu cầu nhập nguyên vật liệu theo materialId
  const getMaterialRequestsByMaterialId = async (materialId: string) => {
    try {
      const requestsRef = collection(db, "materialRequests")
      const q = query(requestsRef, where("materialId", "==", materialId))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MaterialRequest
      })
    } catch (error: any) {
      console.error("Lỗi khi lấy yêu cầu nhập nguyên vật liệu theo materialId:", error)
      setError(`Lỗi khi lấy yêu cầu nhập nguyên vật liệu theo materialId: ${error.message}`)
      return []
    }
  }

  // Cập nhật số lượng nguyên vật liệu
  const updateMaterialQuantity = async (materialId: string, quantity: number, isAddition = true) => {
    try {
      const materialRef = doc(db, "materials", materialId)
      const materialSnap = await getDoc(materialRef)

      if (!materialSnap.exists()) {
        throw new Error("Không tìm thấy nguyên vật liệu")
      }

      const materialData = materialSnap.data() as Material
      const newQuantity = isAddition ? materialData.quantity + quantity : quantity

      await updateDoc(materialRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      })

      setMaterials((prev) =>
        prev.map((material) => {
          if (material.id === materialId) {
            return {
              ...material,
              quantity: newQuantity,
              updatedAt: new Date(),
            }
          }
          return material
        }),
      )
    } catch (error: any) {
      console.error("Lỗi khi cập nhật số lượng nguyên vật liệu:", error)
      setError(`Lỗi khi cập nhật số lượng nguyên vật liệu: ${error.message}`)
      throw error
    }
  }

  // Làm mới dữ liệu
  const refreshData = async () => {
    await fetchData()
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
    refreshData,
  }

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>
}

// Giữ lại tên cũ để tương thích ngược
export const MaterialProvider = MaterialContextProvider

export function useMaterialContext() {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error("useMaterialContext must be used within a MaterialContextProvider")
  }
  return context
}
