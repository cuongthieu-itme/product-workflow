"use client"

import { useEffect, useState } from "react"
import { FirebaseConnectionChecker } from "./firebase-connection-checker"
import { useToast } from "@/components/ui/use-toast"
import { initializeData } from "@/lib/init-data"

export function InitClient() {
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're online before attempting to initialize
        if (!navigator.onLine) {
          console.log("Browser is offline, delaying initialization")
          toast({
            title: "Chế độ ngoại tuyến",
            description: "Ứng dụng đang chạy ở chế độ ngoại tuyến. Dữ liệu sẽ được đồng bộ khi có kết nối.",
            variant: "warning",
          })
          return
        }

        await initializeData()
        setInitialized(true)
        console.log("Data initialized successfully")
      } catch (error) {
        console.error("Error initializing data:", error)
        toast({
          title: "Lỗi khởi tạo dữ liệu",
          description: "Đã xảy ra lỗi khi khởi tạo dữ liệu. Một số tính năng có thể không hoạt động đúng.",
          variant: "destructive",
        })
      }
    }

    init()

    // Set up listener for when we come back online
    const handleOnline = () => {
      console.log("Browser came online, attempting to initialize data")
      init()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [toast])

  return <FirebaseConnectionChecker />
}
