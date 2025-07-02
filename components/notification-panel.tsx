"use client"

import { useState } from "react"
import { useWorkflow } from "@/components/workflow-context"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function NotificationPanel() {
  const { products, markNotificationAsRead } = useWorkflow()
  const [open, setOpen] = useState(false)

  // Lấy tất cả thông báo từ tất cả sản phẩm
  const allNotifications = products.flatMap((product) =>
    product.notifications.map((notification) => ({
      ...notification,
      productId: product.id,
      productName: product.name,
    })),
  )

  // Sắp xếp theo thời gian, mới nhất lên đầu
  const sortedNotifications = [...allNotifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Đếm số thông báo chưa đọc
  const unreadCount = allNotifications.filter((n) => !n.read).length

  // Format thời gian
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // Nếu ít hơn 1 ngày
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000))
        return `${minutes} phút trước`
      }
      return `${hours} giờ trước`
    }

    // Nếu ít hơn 7 ngày
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `${days} ngày trước`
    }

    // Ngày tháng đầy đủ
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const handleMarkAsRead = (productId: string, notificationId: string) => {
    markNotificationAsRead(productId, notificationId)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Thông Báo</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Không có thông báo nào</div>
          ) : (
            <div className="divide-y">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("p-4 hover:bg-muted/50 transition-colors", !notification.read && "bg-muted/20")}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">{formatTime(notification.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{notification.productName}</span>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleMarkAsRead(notification.productId, notification.id)}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
