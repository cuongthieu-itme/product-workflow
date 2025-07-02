"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shuffle, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserSelectorProps {
  selectedUser: UserType | null
  onSelectUser: (user: UserType | null) => void
  allowedUsers?: string[] // Mảng ID của những người được phép thực hiện step này
  assigneeRole?: string
  placeholder?: string
}

export interface UserType {
  id: string
  name: string
  department?: string
  position?: string
  email?: string
}

export function UserSelector({
  selectedUser,
  onSelectUser,
  allowedUsers = [],
  assigneeRole,
  placeholder = "Chọn người đảm nhiệm",
}: UserSelectorProps) {
  // Thêm vào đầu component UserSelector
  console.log("🔍 UserSelector received allowedUsers:", allowedUsers)
  console.log("🔍 UserSelector received assigneeRole:", assigneeRole)

  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isRandomizing, setIsRandomizing] = useState(false)

  // Lấy danh sách người dùng từ Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersRef = collection(db, "users")
        const snapshot = await getDocs(usersRef)

        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name:
              data.fullName || data.fullname || data.displayName || data.name || data.email || "Người dùng không tên",
            department: data.department || data.phongBan || "",
            position: data.position || data.chucVu || "",
            email: data.email || "",
          } as UserType
        })

        setUsers(usersData)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error)
        // Fallback data nếu Firebase lỗi
        const sampleUsers: UserType[] = [
          { id: "FHq19DvZunFcXbTLftMp", name: "Nguyễn Văn A", department: "R&D", position: "Nhân viên tiếp nhận" },
          { id: "5FRPzXfxyDipfZUb6hbX", name: "Trần Thị B", department: "QC", position: "Nhân viên kiểm tra" },
          { id: "MYelzq3eNurFLB9xxn8c", name: "Lê Văn C", department: "Design", position: "Nhân viên thiết kế" },
        ]
        setUsers(sampleUsers)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Lọc users theo allowedUsers - CHỈ hiển thị những người trong allowedUsers
  useEffect(() => {
    console.log(
      "🔍 All users:",
      users.map((u) => `${u.id}: ${u.name}`),
    )
    console.log("🔍 AllowedUsers array:", allowedUsers)

    if (allowedUsers.length > 0) {
      const filtered = users.filter((user) => {
        const isAllowed = allowedUsers.includes(user.id)
        console.log(`🔍 User ${user.name} (${user.id}): ${isAllowed ? "ALLOWED" : "NOT ALLOWED"}`)
        return isAllowed
      })
      console.log(
        `🔍 Final filtered users:`,
        filtered.map((u) => u.name),
      )
      setFilteredUsers(filtered)
    } else {
      console.log("⚠️ No allowedUsers provided")
      setFilteredUsers([])
    }
  }, [users, allowedUsers])

  // Random selection function
  const handleRandomSelect = async () => {
    if (filteredUsers.length === 0) return

    setIsRandomizing(true)

    // Add some visual effect for randomization
    const randomizationSteps = 5
    const stepDelay = 100

    for (let i = 0; i < randomizationSteps; i++) {
      const randomIndex = Math.floor(Math.random() * filteredUsers.length)
      const randomUser = filteredUsers[randomIndex]
      onSelectUser(randomUser)

      if (i < randomizationSteps - 1) {
        await new Promise((resolve) => setTimeout(resolve, stepDelay))
      }
    }

    // Final selection
    setTimeout(() => {
      const finalIndex = Math.floor(Math.random() * filteredUsers.length)
      const finalUser = filteredUsers[finalIndex]
      onSelectUser(finalUser)
      setIsRandomizing(false)

      console.log("🎲 Randomly selected user:", finalUser.name)
    }, stepDelay)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-2 border rounded-md">
        <User className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Đang tải danh sách người dùng...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            value={selectedUser?.id || "none"} // Updated value prop to be a non-empty string
            onValueChange={(value) => {
              if (!value || value === "none") {
                onSelectUser(null)
              } else {
                const user = filteredUsers.find((u) => u.id === value)
                onSelectUser(user || null)
              }
            }}
            disabled={loading || isRandomizing}
          >
            <SelectTrigger className={isRandomizing ? "animate-pulse" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Không chọn ai</span>
                </div>
              </SelectItem>

              {filteredUsers.length > 0 ? (
                <SelectGroup>
                  <SelectLabel>Danh sách người thực hiện ({filteredUsers.length} người)</SelectLabel>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.position} {user.department ? `• ${user.department}` : ""}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : allowedUsers.length === 0 ? (
                <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                  Bước này chưa được cấu hình danh sách người thực hiện
                </div>
              ) : (
                <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                  Không tìm thấy nhân viên nào trong danh sách được phép thực hiện
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {filteredUsers.length > 1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRandomSelect}
                  disabled={loading || isRandomizing || filteredUsers.length === 0}
                  className="px-2"
                >
                  <Shuffle className={`h-4 w-4 ${isRandomizing ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chọn ngẫu nhiên từ {filteredUsers.length} người phù hợp</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Display current selection info */}
      {selectedUser && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <User className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-blue-900">{selectedUser.name}</div>
            <div className="text-xs text-blue-600">
              {selectedUser.position} {selectedUser.department ? `• ${selectedUser.department}` : ""}
            </div>
            {selectedUser.email && <div className="text-xs text-blue-500">{selectedUser.email}</div>}
          </div>
          {isRandomizing && (
            <Badge variant="secondary" className="animate-pulse">
              Đang chọn...
            </Badge>
          )}
        </div>
      )}

      {/* Display role info */}
      {assigneeRole && (
        <div className="text-xs text-muted-foreground">
          <span>Vai trò: </span>
          <Badge variant="outline" className="ml-1">
            {assigneeRole}
          </Badge>
        </div>
      )}

      {/* Display filter info */}
      {allowedUsers.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span>Có {filteredUsers.length} người được phép thực hiện bước này</span>
        </div>
      )}
    </div>
  )
}
