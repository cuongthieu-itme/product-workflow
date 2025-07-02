"use client"

import { useEffect, useState } from "react"
import { collection, query, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"

export function FirebaseConnectionChecker() {
  const [status, setStatus] = useState<"checking" | "success" | "error" | "offline">("checking")
  const [message, setMessage] = useState<string>("Đang kiểm tra kết nối Firebase...")
  const [retryCount, setRetryCount] = useState(0)

  const checkConnection = async () => {
    try {
      setStatus("checking")
      setMessage("Đang kiểm tra kết nối Firebase...")
      console.log("Kiểm tra kết nối Firebase...")
      console.log("Firebase config:", {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Not set",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Not set",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Not set",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Set" : "Not set",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Set" : "Not set",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Set" : "Not set",
      })

      // First check internet connectivity
      try {
        const online = navigator.onLine
        if (!online) {
          setStatus("offline")
          setMessage("Không có kết nối internet. Vui lòng kiểm tra kết nối mạng của bạn.")
          return
        }
      } catch (e) {
        console.log("Error checking online status:", e)
      }

      // Set up a listener with timeout
      const testQuery = collection(db, "users")

      // Create a promise that resolves when the first snapshot arrives
      const snapshotPromise = new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          query(testQuery, limit(1)),
          (snapshot) => {
            unsubscribe()
            resolve(snapshot)
          },
          (error) => {
            unsubscribe()
            reject(error)
          },
        )
      })

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      })

      // Race the snapshot against the timeout
      await Promise.race([snapshotPromise, timeoutPromise])

      setStatus("success")
      setMessage("Kết nối Firebase thành công!")
      console.log("Kết nối Firebase thành công!")
    } catch (error) {
      console.error("Lỗi kết nối Firebase:", error)

      // Check if it's a network error
      if (
        error instanceof Error &&
        (error.message.includes("network") ||
          error.message.includes("unavailable") ||
          error.message.includes("timeout") ||
          error.message.includes("could not reach"))
      ) {
        setStatus("offline")
        setMessage(`Không thể kết nối đến Firebase. Ứng dụng sẽ hoạt động ở chế độ ngoại tuyến.`)
      } else {
        setStatus("error")
        setMessage(`Lỗi kết nối Firebase: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  useEffect(() => {
    checkConnection()

    // Set up network status listeners
    const handleOnline = () => {
      console.log("Browser went online")
      checkConnection()
    }

    const handleOffline = () => {
      console.log("Browser went offline")
      setStatus("offline")
      setMessage("Không có kết nối internet. Ứng dụng sẽ hoạt động ở chế độ ngoại tuyến.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (status === "checking") {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-700" />
        <AlertTitle className="text-blue-700">Đang kiểm tra kết nối</AlertTitle>
        <AlertDescription className="text-blue-700">{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lỗi kết nối</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <div>{message}</div>
          <Button variant="outline" size="sm" onClick={handleRetry} className="self-start mt-2">
            <RefreshCw className="h-4 w-4 mr-2" /> Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "offline") {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <WifiOff className="h-4 w-4 text-amber-700" />
        <AlertTitle className="text-amber-700">Chế độ ngoại tuyến</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 text-amber-700">
          <div>{message}</div>
          <div className="text-sm">Một số tính năng có thể bị hạn chế cho đến khi kết nối được khôi phục.</div>
          <Button variant="outline" size="sm" onClick={handleRetry} className="self-start mt-2 border-amber-300">
            <RefreshCw className="h-4 w-4 mr-2" /> Kiểm tra lại kết nối
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <Wifi className="h-4 w-4 text-green-700" />
      <AlertTitle className="text-green-700">Đã kết nối</AlertTitle>
      <AlertDescription className="text-green-700">{message}</AlertDescription>
    </Alert>
  )
}
