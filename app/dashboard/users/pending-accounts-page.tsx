"use client"

import { useState, useEffect } from "react"
import { PendingAccounts } from "@/components/users/pending-accounts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"

export default function PendingAccountsPage() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const pendingUsersRef = collection(db, "pendingUsers")
        const snapshot = await getDocs(pendingUsersRef)
        setPendingCount(snapshot.size)
      } catch (error) {
        console.error("Error fetching pending users count:", error)
      }
    }

    fetchPendingCount()
    // Thiết lập interval để cập nhật số lượng tài khoản chờ duyệt mỗi 30 giây
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Tài khoản chờ duyệt
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Tài khoản đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Tài khoản đã từ chối</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản chờ duyệt</CardTitle>
              <CardDescription>
                Danh sách các tài khoản đang chờ được duyệt. Bạn có thể duyệt hoặc từ chối các tài khoản này.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingAccounts />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản đã duyệt</CardTitle>
              <CardDescription>Danh sách các tài khoản đã được duyệt và đang hoạt động.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Chức năng đang được phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản đã từ chối</CardTitle>
              <CardDescription>Danh sách các tài khoản đã bị từ chối.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Chức năng đang được phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
