'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface User {
  id: string
  name: string
  email: string
  role?: string
  department?: string
  avatar?: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: Date
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const parseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined

    try {
      // If it's a Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        return dateValue.toDate()
      }

      // If it's a string or number, try to parse it
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const parsed = new Date(dateValue)
        return isNaN(parsed.getTime()) ? undefined : parsed
      }

      // If it's already a Date object
      if (dateValue instanceof Date) {
        return dateValue
      }

      return undefined
    } catch (error) {
      console.warn('Error parsing date:', error)
      return undefined
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        const usersRef = collection(db, 'users')
        const querySnapshot = await getDocs(usersRef)

        const fetchedUsers: User[] = []
        querySnapshot.forEach((doc) => {
          const userData = doc.data()

          // Filter active users on client side
          if (userData.status === 'active' || !userData.status) {
            fetchedUsers.push({
              id: doc.id,
              name:
                userData.name ||
                userData.fullName ||
                userData.displayName ||
                'Không xác định',
              email: userData.email || '',
              role: userData.role,
              department: userData.department || userData.phongBan,
              avatar: userData.avatar,
              status: userData.status || 'active',
              createdAt: parseDate(userData.createdAt)
            })
          }
        })

        // Sort on client side
        fetchedUsers.sort((a, b) => a.name.localeCompare(b.name))
        setUsers(fetchedUsers)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        )

        // Fallback to localStorage if Firebase fails
        try {
          const localUsers = localStorage.getItem('users')
          if (localUsers) {
            const parsedUsers = JSON.parse(localUsers)
            const formattedUsers = parsedUsers.map((user: any) => ({
              id: user.id,
              name:
                user.fullName ||
                user.name ||
                user.username ||
                'Người dùng không tên',
              email: user.email || '',
              role: user.role || '',
              department: user.department || '',
              status: 'active',
              createdAt: parseDate(user.createdAt)
            }))
            setUsers(formattedUsers)
          }
        } catch (localError) {
          console.error('Lỗi khi lấy dữ liệu từ localStorage:', localError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, loading, error }
}
