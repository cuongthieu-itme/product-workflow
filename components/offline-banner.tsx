"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine)

    // Set up event listeners
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <Alert
      variant="warning"
      className="fixed bottom-0 left-0 right-0 z-50 bg-amber-100 border-amber-300 mb-0 rounded-none"
    >
      <WifiOff className="h-4 w-4 text-amber-800" />
      <AlertDescription className="text-amber-800">
        Bạn đang ở chế độ ngoại tuyến. Một số tính năng có thể không hoạt động cho đến khi kết nối được khôi phục.
      </AlertDescription>
    </Alert>
  )
}
