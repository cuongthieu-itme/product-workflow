"use client"

import { useEffect, useState } from "react"
import { historyService } from "@/lib/history-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function HistoryCollectionInitializer() {
  const [status, setStatus] = useState<"checking" | "exists" | "initialized" | "error">("checking")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkHistoryCollection()
  }, [])

  const checkHistoryCollection = async () => {
    setStatus("checking")
    try {
      const exists = await historyService.checkHistoryCollectionExists()
      setStatus(exists ? "exists" : "error")
    } catch (error) {
      console.error("Error checking history collection:", error)
      setStatus("error")
    }
  }

  const initializeCollection = async () => {
    setLoading(true)
    try {
      const success = await historyService.initializeHistoryCollection()
      if (success) {
        setStatus("initialized")
        toast({
          title: "Thành công",
          description: "Đã khởi tạo collection lịch sử thành công",
        })
      } else {
        setStatus("error")
        toast({
          title: "Lỗi",
          description: "Không thể khởi tạo collection lịch sử",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error initializing history collection:", error)
      setStatus("error")
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi khởi tạo collection lịch sử",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "checking") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Đang kiểm tra</AlertTitle>
        <AlertDescription>Đang kiểm tra collection lịch sử...</AlertDescription>
      </Alert>
    )
  }

  if (status === "exists" || status === "initialized") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Collection lịch sử đã sẵn sàng</AlertTitle>
        <AlertDescription className="text-green-700">
          Collection lịch sử đã được khởi tạo và sẵn sàng sử dụng.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khởi tạo Collection Lịch sử</CardTitle>
        <CardDescription>
          Collection lịch sử chưa tồn tại hoặc chưa được khởi tạo đúng cách. Bạn cần khởi tạo collection này để có thể
          lưu trữ lịch sử thay đổi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cần khởi tạo</AlertTitle>
          <AlertDescription>
            Hệ thống không thể tìm thấy collection lịch sử trong cơ sở dữ liệu. Vui lòng khởi tạo để đảm bảo tính năng
            lịch sử hoạt động đúng.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeCollection} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Đang khởi tạo..." : "Khởi tạo Collection Lịch sử"}
        </Button>
      </CardFooter>
    </Card>
  )
}
