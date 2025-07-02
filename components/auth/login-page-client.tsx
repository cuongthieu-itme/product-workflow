"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function LoginPageClient() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Kiểm tra tài khoản từ Firestore - phân biệt chữ hoa/chữ thường
      const usersRef = collection(db, "users")
      const userQuery = query(
        usersRef,
        where("username", "==", username),
        where("password", "==", password),
        where("status", "==", "active"),
      )

      const userSnapshot = await getDocs(userQuery)

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data()

        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("username", username)
        localStorage.setItem("userRole", userData.role || "user")
        localStorage.setItem("userDepartment", userData.department || "")
        localStorage.setItem("isAuthenticated", "true")

        // Tạo cookie để middleware có thể kiểm tra
        document.cookie = `authToken=true; path=/; max-age=${60 * 60 * 24 * 7}` // 7 ngày
        document.cookie = `userRole=${userData.role || "user"}; path=/; max-age=${60 * 60 * 24 * 7}`

        // Chuyển hướng đến trang dashboard
        router.push("/dashboard")
      } else {
        // Kiểm tra tài khoản mặc định
        if (username === "admin" && password === "admin") {
          localStorage.setItem("username", "admin")
          localStorage.setItem("userRole", "admin")
          localStorage.setItem("userDepartment", "admin")
          localStorage.setItem("isAuthenticated", "true")

          // Tạo cookie để middleware có thể kiểm tra
          document.cookie = `authToken=true; path=/; max-age=${60 * 60 * 24 * 7}` // 7 ngày
          document.cookie = `userRole=admin; path=/; max-age=${60 * 60 * 24 * 7}`

          // Chuyển hướng đến trang dashboard
          router.push("/dashboard")
        } else {
          setError("Tên đăng nhập hoặc mật khẩu không đúng")
        }
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error)
      setError(`Lỗi đăng nhập: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin đăng nhập của bạn để truy cập hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
