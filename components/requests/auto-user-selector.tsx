'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, RefreshCw, AlertCircle } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AutoUserSelectorProps {
  allowedUsers: string[] // Mảng ID của những người được phép thực hiện
  onUserAssigned: (user: UserType | null) => void
  assigneeRole?: string
  showReassignButton?: boolean
}

export interface UserType {
  id: string
  name: string
  department?: string
  position?: string
  email?: string
}

export function AutoUserSelector({
  allowedUsers,
  onUserAssigned,
  assigneeRole,
  showReassignButton = true
}: AutoUserSelectorProps) {
  const [assignedUser, setAssignedUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [reassigning, setReassigning] = useState(false)

  // Load users từ Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)

        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name:
              data.fullName ||
              data.fullname ||
              data.displayName ||
              data.name ||
              data.email ||
              'Người dùng không tên',
            department: data.department || data.phongBan || '',
            position: data.position || data.chucVu || '',
            email: data.email || ''
          } as UserType
        })

        setUsers(usersData)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error)
        // Fallback data
        const sampleUsers: UserType[] = [
          {
            id: 'FHq19DvZunFcXbTLftMp',
            name: 'Nguyễn Văn A',
            department: 'R&D',
            position: 'Nhân viên tiếp nhận'
          },
          {
            id: '5FRPzXfxyDipfZUb6hbX',
            name: 'Trần Thị B',
            department: 'QC',
            position: 'Nhân viên kiểm tra'
          },
          {
            id: 'MYelzq3eNurFLB9xxn8c',
            name: 'Lê Văn C',
            department: 'Design',
            position: 'Nhân viên thiết kế'
          }
        ]
        setUsers(sampleUsers)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Tự động assign user khi có data
  useEffect(() => {
    if (
      !loading &&
      users.length > 0 &&
      allowedUsers.length > 0 &&
      !assignedUser
    ) {
      autoAssignUser()
    }
  }, [loading, users, allowedUsers, assignedUser])

  const autoAssignUser = () => {
    // Lọc users theo allowedUsers
    const availableUsers = users.filter((user) =>
      allowedUsers.includes(user.id)
    )

    console.log('🎯 AllowedUsers IDs:', allowedUsers)
    console.log(
      '📋 All users:',
      users.map((u) => `${u.id}: ${u.name}`)
    )
    console.log(
      '✅ Available users for assignment:',
      availableUsers.map((u) => `${u.id}: ${u.name}`)
    )

    if (availableUsers.length > 0) {
      // Random chọn 1 người
      const randomIndex = Math.floor(Math.random() * availableUsers.length)
      const selectedUser = availableUsers[randomIndex]

      console.log(
        `🎲 Auto-assigned user: ${selectedUser.name} (${selectedUser.id}) for role: ${assigneeRole}`
      )
      setAssignedUser(selectedUser)
      onUserAssigned(selectedUser)
    } else {
      console.log('❌ No available users for this step')
      console.log('🔍 Check if allowedUsers IDs match user IDs in database')
      setAssignedUser(null)
      onUserAssigned(null)
    }
  }

  const handleReassign = async () => {
    setReassigning(true)

    // Hiệu ứng loading
    await new Promise((resolve) => setTimeout(resolve, 500))

    setAssignedUser(null)
    autoAssignUser()
    setReassigning(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
        <User className="h-4 w-4 animate-pulse text-gray-400" />
        <span className="text-sm text-gray-500">Đang phân công tự động...</span>
      </div>
    )
  }

  if (allowedUsers.length === 0) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">
          Không có nhân viên nào được phép thực hiện bước này
        </span>
      </div>
    )
  }

  if (!assignedUser) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-yellow-600">
          Không tìm thấy nhân viên phù hợp trong hệ thống
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Hiển thị người được assign */}
      <div className="flex items-center justify-between p-3 border rounded-md bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium text-green-900">
              {assignedUser.name}
            </div>
            <div className="text-xs text-green-600">
              {assignedUser.position}
              {assignedUser.department && ` • ${assignedUser.department}`}
            </div>
            {assignedUser.email && (
              <div className="text-xs text-green-500">{assignedUser.email}</div>
            )}
          </div>
        </div>

        {showReassignButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReassign}
            disabled={reassigning}
            className="text-green-600 border-green-300 hover:bg-green-100"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${reassigning ? 'animate-spin' : ''}`}
            />
            {reassigning ? 'Đang chọn...' : 'Chọn lại'}
          </Button>
        )}
      </div>

      {/* Thông tin vai trò */}
      {assigneeRole && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Vai trò:</span>
          <Badge variant="outline" className="text-xs">
            {assigneeRole}
          </Badge>
        </div>
      )}

      {/* Thông tin số người có thể chọn */}
      <div className="text-xs text-gray-400">
        Được chọn tự động từ{' '}
        {users.filter((u) => allowedUsers.includes(u.id)).length} người trong
        danh sách được phép
        {allowedUsers.length > 0 && (
          <div className="mt-1">
            <span className="font-mono text-xs">
              IDs: {allowedUsers.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
