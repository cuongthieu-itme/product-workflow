"use client"

import { useMaterialContext } from "./material-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, Clock } from "lucide-react"
import { parseISO, isAfter } from "date-fns"

export function MaterialStats() {
  const { materials, materialRequests } = useMaterialContext()

  // Số lượng nguyên vật liệu đang hoạt động
  const activeMaterials = materials.filter((m) => m.isActive).length

  // Số lượng nguyên vật liệu hết hàng
  const outOfStockMaterials = materials.filter((m) => m.quantity === 0).length

  // Số lượng đơn yêu cầu đang chờ
  const pendingRequests = materialRequests.filter((r) => r.status === "pending").length

  // Số lượng đơn yêu cầu trễ hạn
  const delayedRequests = materialRequests.filter(
    (r) => r.status === "delayed" || (r.status !== "completed" && isAfter(new Date(), parseISO(r.expectedDate))),
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nguyên vật liệu</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{materials.length}</div>
          <p className="text-xs text-muted-foreground">
            {activeMaterials} đang hoạt động, {materials.length - activeMaterials} đã tắt
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{outOfStockMaterials}</div>
          <p className="text-xs text-muted-foreground">
            {outOfStockMaterials > 0 ? (
              <Badge variant="destructive" className="mt-1">
                Cần nhập thêm
              </Badge>
            ) : (
              "Không có nguyên vật liệu nào hết hàng"
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đơn yêu cầu</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{materialRequests.length}</div>
          <p className="text-xs text-muted-foreground">
            {pendingRequests} đang chờ, {materialRequests.length - pendingRequests} đã xử lý
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trễ hạn</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{delayedRequests}</div>
          <p className="text-xs text-muted-foreground">
            {delayedRequests > 0 ? (
              <Badge variant="destructive" className="mt-1">
                Cần xử lý gấp
              </Badge>
            ) : (
              "Không có đơn yêu cầu nào trễ hạn"
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
