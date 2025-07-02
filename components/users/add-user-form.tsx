"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { collection, addDoc, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Danh sách username bị cấm (trừ khi role là admin)
const RESERVED_USERNAMES = ["admin", "administrator", "root", "system"]

interface Department {
  id: string
  name: string
  description: string
}

interface AddUserFormProps {
  onUserAdded?: () => void
}

export function AddUserForm({ onUserAdded }: AddUserFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    department: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [departmentError, setDepartmentError] = useState<string | null>(null)

  // Kiểm tra kết nối Firebase và lấy danh sách phòng ban khi component được tải
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Thử truy cập collection để kiểm tra kết nối
        const testQuery = collection(db, "users")
        await getDocs(query(testQuery, limit(1)))
        console.log("Firebase connection successful")

        // Lấy danh sách phòng ban từ Firestore
        await fetchDepartments()
      } catch (error) {
        console.error("Lỗi kết nối Firebase:", error)
      }
    }

    checkFirebaseConnection()
  }, [])

  // Hàm lấy danh sách phòng ban từ Firestore
  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    setDepartmentError(null)

    try {
      console.log("Đang lấy danh sách phòng ban từ Firestore...")
      const departmentsCollection = collection(db, "departments")
      const departmentsSnapshot = await getDocs(departmentsCollection)

      if (departmentsSnapshot.empty) {
        console.log("Không có phòng ban nào trong Firestore")
        setDepartments([])
      } else {
        // Lấy dữ liệu từ Firestore
        const departmentsData = departmentsSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
          } as Department
        })
        console.log("Đã lấy được", departmentsData.length, "phòng ban từ Firestore")
        setDepartments(departmentsData)
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng ban:", error)
      setDepartmentError(`Lỗi khi lấy danh sách phòng ban: ${error instanceof Error ? error.message : String(error)}`)

      // Sử dụng dữ liệu từ localStorage nếu có lỗi
      try {
        if (typeof window !== "undefined") {
          const storedDepartments = JSON.parse(localStorage.getItem("departments") || "[]")
          const simplifiedDepartments = storedDepartments.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            description: dept.description,
          }))
          setDepartments(simplifiedDepartments)
          console.log("Đã sử dụng dữ liệu từ localStorage do lỗi Firestore")
        }
      } catch (localError) {
        console.error("Lỗi khi lấy dữ liệu từ localStorage:", localError)
      }
    } finally {
      setLoadingDepartments(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    console.log("Bắt đầu xử lý thêm người dùng với dữ liệu:", formData)

    try {
      // Kiểm tra username có nằm trong danh sách bị cấm không
      if (RESERVED_USERNAMES.includes(formData.username.toLowerCase()) && formData.role !== "admin") {
        setError(`Tên đăng nhập "${formData.username}" đã được đặt trước. Vui lòng chọn tên đăng nhập khác.`)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: `Tên đăng nhập "${formData.username}" đã được đặt trước. Vui lòng chọn tên đăng nhập khác.`,
        })
        setLoading(false)
        return
      }

      // Kiểm tra mật khẩu xác nhận
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp")
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Mật khẩu xác nhận không khớp",
        })
        setLoading(false)
        return
      }

      console.log("Đang kiểm tra username và email...")

      // Kiểm tra username đã tồn tại chưa trong Firebase
      const usersRef = collection(db, "users")
      const pendingUsersRef = collection(db, "pendingUsers")

      // Check if username exists in users collection
      const usersQuery = query(usersRef, where("username", "==", formData.username.trim()))
      const usersSnapshot = await getDocs(usersQuery)
      console.log("Kết quả kiểm tra username trong users:", !usersSnapshot.empty)

      // Check if username exists in pendingUsers collection
      const pendingUsersQuery = query(pendingUsersRef, where("username", "==", formData.username.trim()))
      const pendingUsersSnapshot = await getDocs(pendingUsersQuery)
      console.log("Kết quả kiểm tra username trong pendingUsers:", !pendingUsersSnapshot.empty)

      if (!usersSnapshot.empty || !pendingUsersSnapshot.empty) {
        setError("Tên đăng nhập đã tồn tại")
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.",
        })
        setLoading(false)
        return
      }

      // Kiểm tra email đã tồn tại chưa
      const emailQuery = query(usersRef, where("email", "==", formData.email.trim()))
      const emailSnapshot = await getDocs(emailQuery)
      console.log("Kết quả kiểm tra email trong users:", !emailSnapshot.empty)

      // Check if email exists in pendingUsers collection
      const pendingEmailQuery = query(pendingUsersRef, where("email", "==", formData.email.trim()))
      const pendingEmailSnapshot = await getDocs(pendingEmailQuery)
      console.log("Kết quả kiểm tra email trong pendingUsers:", !pendingEmailSnapshot.empty)

      if (!emailSnapshot.empty || !pendingEmailSnapshot.empty) {
        setError("Email đã được sử dụng")
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Email đã được sử dụng. Vui lòng sử dụng email khác.",
        })
        setLoading(false)
        return
      }

      // Tạo người dùng mới
      const newUser = {
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        role: formData.role,
        department: formData.department,
        status: "active",
        createdAt: new Date().toISOString(),
      }

      console.log("Đang thêm người dùng mới vào users:", newUser)

      // Thêm vào collection users trong Firebase
      const docRef = await addDoc(usersRef, newUser)
      console.log("Đã thêm người dùng với ID:", docRef.id)

      // Hiển thị thông báo thành công
      setSuccess(true)
      toast({
        title: "Thành công",
        description: `Tài khoản ${formData.username} đã được tạo thành công.`,
      })

      // Reset form
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        email: "",
        phone: "",
        role: "user",
        department: "",
      })

      // Gọi callback nếu có
      if (onUserAdded) {
        onUserAdded()
      }
    } catch (error) {
      console.error("Lỗi khi tạo người dùng:", error)
      setError(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tạo người dùng. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {departmentError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{departmentError}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Thành công!</AlertTitle>
          <AlertDescription className="text-green-700">Tài khoản đã được tạo thành công.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange(value, "role")}
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Phòng ban</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleSelectChange(value, "department")}
              disabled={loading || loadingDepartments}
            >
              <SelectTrigger id="department">
                {loadingDepartments ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Chọn phòng ban" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo người dùng"}
          </Button>
        </div>
      </form>
    </div>
  )
}
