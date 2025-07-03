import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth/next'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export function isAdmin() {
  // Kiểm tra trong môi trường client
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole')
    return userRole === 'admin'
  }
  return false
}

export function isAuthenticated() {
  // Kiểm tra trong môi trường client
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('username')
  }
  return false
}

export function getUserRole() {
  // Kiểm tra trong môi trường client
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userRole') || ''
  }
  return ''
}

export function getUserDepartment() {
  // Kiểm tra trong môi trường client
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userDepartment') || ''
  }
  return ''
}

export function logout() {
  // Xóa thông tin đăng nhập
  if (typeof window !== 'undefined') {
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userDepartment')

    // Xóa cookie
    document.cookie = 'authToken=; path=/; max-age=0'
    document.cookie = 'userRole=; path=/; max-age=0'
  }
}
