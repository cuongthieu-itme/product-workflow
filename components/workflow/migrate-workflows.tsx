"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react"
import { migrateWorkflowsToSubWorkflows, deleteWorkflowsCollection } from "@/lib/migrate-workflows"

export function MigrateWorkflows() {
  const [loading, setLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; message: string } | null>(null)
  const [step, setStep] = useState<"initial" | "migrated" | "deleted">("initial")

  const handleMigrate = async () => {
    setLoading(true)
    try {
      const result = await migrateWorkflowsToSubWorkflows()
      setMigrationResult(result)
      if (result.success) {
        setStep("migrated")
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: `Lỗi không xác định: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteWorkflowsCollection()
      setDeleteResult(result)
      if (result.success) {
        setStep("deleted")
      }
    } catch (error) {
      setDeleteResult({
        success: false,
        message: `Lỗi không xác định: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Di chuyển dữ liệu từ collection workflows</CardTitle>
        <CardDescription>
          Di chuyển dữ liệu từ collection workflows sang subWorkflows và xóa collection workflows cũ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === "initial" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === "migrated" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === "deleted" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </div>
        </div>

        {step === "initial" && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lưu ý quan trọng</AlertTitle>
              <AlertDescription>
                Hãy đảm bảo bạn đã sao lưu dữ liệu trước khi thực hiện di chuyển. Quá trình này không thể hoàn tác.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Quá trình di chuyển sẽ thực hiện:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Di chuyển dữ liệu từ collection workflows sang subWorkflows</li>
                <li>Cập nhật liên kết giữa trạng thái sản phẩm và quy trình</li>
                <li>Ánh xạ các bước quy trình với quy trình chuẩn</li>
              </ul>
            </div>

            {migrationResult && (
              <Alert variant={migrationResult.success ? "default" : "destructive"}>
                {migrationResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{migrationResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "migrated" && (
          <div className="space-y-4">
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Di chuyển dữ liệu thành công</AlertTitle>
              <AlertDescription>
                Dữ liệu đã được di chuyển từ collection workflows sang subWorkflows. Bạn có thể xóa collection workflows
                cũ.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Bước tiếp theo:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Xóa collection workflows cũ để tránh xung đột</li>
                <li>Đảm bảo tất cả các component đã được cập nhật để sử dụng API mới</li>
              </ul>
            </div>

            {deleteResult && (
              <Alert variant={deleteResult.success ? "default" : "destructive"}>
                {deleteResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{deleteResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "deleted" && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Hoàn tất</AlertTitle>
            <AlertDescription>
              Quá trình di chuyển dữ liệu và xóa collection workflows cũ đã hoàn tất. Hệ thống đã sẵn sàng sử dụng API
              mới.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {step === "initial" && (
          <Button onClick={handleMigrate} disabled={loading}>
            {loading ? "Đang di chuyển..." : "Di chuyển dữ liệu"}
          </Button>
        )}
        {step === "migrated" && (
          <Button onClick={handleDelete} disabled={loading} variant="destructive">
            {loading ? "Đang xóa..." : "Xóa collection workflows"}
          </Button>
        )}
        {step === "deleted" && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Làm mới trang
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
