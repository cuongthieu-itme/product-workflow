"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, Timestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function CheckMaterialCollections() {
  const [loading, setLoading] = useState(true)
  const [materialRequestsExists, setMaterialRequestsExists] = useState(false)
  const [materialImportRequestsExists, setMaterialImportRequestsExists] = useState(false)
  const [initializingMaterialRequests, setInitializingMaterialRequests] = useState(false)
  const [initializingMaterialImportRequests, setInitializingMaterialImportRequests] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkCollections()
  }, [])

  const checkCollections = async () => {
    setLoading(true)
    setError(null)
    try {
      // Kiểm tra collection materialRequests
      const materialRequestsSnapshot = await getDocs(collection(db, "materialRequests"))
      setMaterialRequestsExists(!materialRequestsSnapshot.empty)

      // Kiểm tra collection materialImportRequests
      const materialImportRequestsSnapshot = await getDocs(collection(db, "materialImportRequests"))
      setMaterialImportRequestsExists(!materialImportRequestsSnapshot.empty)
    } catch (err: any) {
      console.error("Lỗi khi kiểm tra collections:", err)
      setError(`Lỗi khi kiểm tra collections: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const initializeMaterialRequests = async () => {
    setInitializingMaterialRequests(true)
    setError(null)
    try {
      // Tạo document mẫu trong collection materialRequests
      const sampleData = {
        materialId: "sample-material-id",
        materialName: "Nguyên vật liệu mẫu",
        quantity: 100,
        expectedDate: new Date().toISOString(),
        supplier: "Nhà cung cấp mẫu",
        status: "pending",
        reason: "Khởi tạo collection",
        sourceCountry: "Việt Nam",
        importPrice: 1000000,
        requestCode: `SAMPLE-${Date.now()}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, "materialRequests", "sample-request"), sampleData)
      setMaterialRequestsExists(true)
      setMessage("Đã khởi tạo collection materialRequests thành công")
    } catch (err: any) {
      console.error("Lỗi khi khởi tạo collection materialRequests:", err)
      setError(`Lỗi khi khởi tạo collection materialRequests: ${err.message}`)
    } finally {
      setInitializingMaterialRequests(false)
    }
  }

  const initializeMaterialImportRequests = async () => {
    setInitializingMaterialImportRequests(true)
    setError(null)
    try {
      // Tạo document mẫu trong collection materialImportRequests
      const sampleData = {
        materialId: "sample-material-id",
        materialName: "Nguyên vật liệu mẫu",
        quantity: 100,
        requestCode: `SAMPLE-IMPORT-${Date.now()}`,
        createdAt: Timestamp.now(),
        status: "pending",
        expectedDate: new Date().toISOString(),
        supplier: "Nhà cung cấp mẫu",
        reason: "Khởi tạo collection",
        sourceCountry: "Việt Nam",
        importPrice: 1000000,
      }

      await setDoc(doc(db, "materialImportRequests", "sample-import-request"), sampleData)
      setMaterialImportRequestsExists(true)
      setMessage("Đã khởi tạo collection materialImportRequests thành công")
    } catch (err: any) {
      console.error("Lỗi khi khởi tạo collection materialImportRequests:", err)
      setError(`Lỗi khi khởi tạo collection materialImportRequests: ${err.message}`)
    } finally {
      setInitializingMaterialImportRequests(false)
    }
  }

  const initializeBothCollections = async () => {
    if (!materialRequestsExists) {
      await initializeMaterialRequests()
    }
    if (!materialImportRequestsExists) {
      await initializeMaterialImportRequests()
    }
    setMessage("Đã khởi tạo tất cả collections thành công")
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Kiểm tra Collections Nguyên vật liệu</CardTitle>
        <CardDescription>
          Kiểm tra và khởi tạo các collections liên quan đến nguyên vật liệu nếu chúng không tồn tại
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang kiểm tra collections...</span>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Collection materialRequests</h3>
                  <p className="text-sm text-muted-foreground">Lưu trữ yêu cầu nhập nguyên vật liệu</p>
                </div>
                <div className="flex items-center">
                  {materialRequestsExists ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Đã tồn tại</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>Chưa tồn tại</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Collection materialImportRequests</h3>
                  <p className="text-sm text-muted-foreground">
                    Lưu trữ yêu cầu nhập nguyên vật liệu từ context yêu cầu
                  </p>
                </div>
                <div className="flex items-center">
                  {materialImportRequestsExists ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Đã tồn tại</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>Chưa tồn tại</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <Alert className="mt-4 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Thành công</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mt-4 bg-red-50" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkCollections} disabled={loading}>
          Kiểm tra lại
        </Button>
        <div className="space-x-2">
          {!materialRequestsExists && (
            <Button
              onClick={initializeMaterialRequests}
              disabled={initializingMaterialRequests || loading}
              variant="secondary"
            >
              {initializingMaterialRequests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Khởi tạo materialRequests
            </Button>
          )}
          {!materialImportRequestsExists && (
            <Button
              onClick={initializeMaterialImportRequests}
              disabled={initializingMaterialImportRequests || loading}
              variant="secondary"
            >
              {initializingMaterialImportRequests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Khởi tạo materialImportRequests
            </Button>
          )}
          {(!materialRequestsExists || !materialImportRequestsExists) && (
            <Button
              onClick={initializeBothCollections}
              disabled={
                (initializingMaterialRequests || initializingMaterialImportRequests || loading) &&
                materialRequestsExists &&
                materialImportRequestsExists
              }
            >
              {(initializingMaterialRequests || initializingMaterialImportRequests) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Khởi tạo tất cả
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
