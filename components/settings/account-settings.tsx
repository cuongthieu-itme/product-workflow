'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Loader2,
  AlertCircle,
  User,
  Mail,
  Building,
  Shield,
  Phone,
  FileText
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { db } from '@/lib/firebase'
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function AccountSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30
  })
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    department: '',
    role: '',
    username: '',
    avatarUrl: '',
    phone: '',
    position: '',
    bio: ''
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([])
  const [departmentNames, setDepartmentNames] = useState<{
    [key: string]: string
  }>({})
  const [debug, setDebug] = useState<any>(null)

  // Lấy thông tin người dùng hiện tại từ Firebase
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (typeof window !== 'undefined') {
        try {
          setIsLoading(true)
          setError(null)

          // Lấy thông tin đăng nhập từ localStorage
          const username = localStorage.getItem('username') || ''
          const userRole = localStorage.getItem('userRole') || ''
          const userDepartment = localStorage.getItem('userDepartment') || ''

          console.log('Thông tin từ localStorage:', {
            username,
            userRole,
            userDepartment
          })

          if (!username) {
            setError(
              'Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.'
            )
            setIsLoading(false)
            return
          }

          // Tìm tất cả người dùng trong Firestore
          const usersRef = collection(db, 'users')
          const allUsersSnapshot = await getDocs(usersRef)
          const allUsers = allUsersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))

          console.log(
            'Tất cả người dùng:',
            allUsers.map((u) => ({
              id: u.id,
              username: u.username,
              department: u.department
            }))
          )

          // Tìm người dùng phù hợp
          let foundUser = null

          // Thử tìm theo username chính xác
          foundUser = allUsers.find((user) => user.username === username)

          // Nếu không tìm thấy, thử tìm theo fullName
          if (!foundUser) {
            foundUser = allUsers.find((user) => user.fullName === username)
          }

          // Nếu vẫn không tìm thấy, thử tìm theo username không phân biệt chữ hoa/thường
          if (!foundUser) {
            foundUser = allUsers.find(
              (user) =>
                user.username?.toLowerCase() === username.toLowerCase() ||
                user.fullName?.toLowerCase() === username.toLowerCase()
            )
          }

          // Nếu là admin đặc biệt
          if (username.toLowerCase() === 'admin' && !foundUser) {
            foundUser = allUsers.find(
              (user) => user.username?.toLowerCase() === 'admin'
            )
          }

          if (foundUser) {
            console.log('Tìm thấy người dùng:', foundUser)
            setUserId(foundUser.id)
            setCurrentUser(foundUser)
            setDebug(foundUser)

            // Cập nhật form data với thông tin hiện tại
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
              twoFactorEnabled: foundUser.twoFactorEnabled || false,
              sessionTimeout: foundUser.sessionTimeout || 30
            })

            // Cập nhật thông tin hồ sơ
            setProfileData({
              fullName: foundUser.fullName || foundUser.username || '',
              email: foundUser.email || '',
              department: foundUser.department || userDepartment || '',
              role: foundUser.role || userRole || '',
              username: foundUser.username || '',
              avatarUrl: foundUser.avatarUrl || '',
              phone: foundUser.phone || '',
              position: foundUser.position || '',
              bio: foundUser.bio || ''
            })

            // Cập nhật localStorage nếu cần
            if (foundUser.username && foundUser.username !== username) {
              localStorage.setItem('username', foundUser.username)
            }
            if (foundUser.role && foundUser.role !== userRole) {
              localStorage.setItem('userRole', foundUser.role)
            }
            if (
              foundUser.department &&
              foundUser.department !== userDepartment
            ) {
              localStorage.setItem('userDepartment', foundUser.department)
            }
          } else {
            console.log('Không tìm thấy người dùng nào phù hợp')
            setError('Không tìm thấy thông tin người dùng trong hệ thống.')

            // Hiển thị thông tin debug
            console.log('Thông tin đăng nhập từ localStorage:', {
              username,
              userRole,
              userDepartment
            })
            console.log('Tất cả người dùng trong hệ thống:', allUsers)
          }
        } catch (error: any) {
          console.error('Lỗi khi lấy thông tin người dùng:', error)
          setError(`Lỗi khi lấy thông tin người dùng: ${error.message}`)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const fetchDepartments = async () => {
      try {
        console.log('Đang lấy danh sách phòng ban từ Firestore...')
        const departmentsCollection = collection(db, 'departments')
        const departmentsSnapshot = await getDocs(departmentsCollection)

        if (!departmentsSnapshot.empty) {
          const departmentsData = departmentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name
          }))

          // Lưu danh sách phòng ban
          setDepartments(departmentsData)

          // Tạo mapping từ id -> name để dễ dàng tra cứu
          const namesMap: { [key: string]: string } = {}
          departmentsData.forEach((dept) => {
            namesMap[dept.id] = dept.name
          })
          setDepartmentNames(namesMap)

          console.log(
            'Đã lấy được',
            departmentsData.length,
            'phòng ban từ Firestore'
          )
        } else {
          console.log('Không có phòng ban nào trong Firestore')
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng ban:', error)
      }
    }

    fetchCurrentUser()
    fetchDepartments()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!currentUser) {
        setError('Không tìm thấy thông tin người dùng.')
        setIsLoading(false)
        return
      }

      // Kiểm tra mật khẩu hiện tại
      if (formData.currentPassword !== currentUser.password) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Mật khẩu hiện tại không đúng'
        })
        setIsLoading(false)
        return
      }

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Mật khẩu mới và xác nhận mật khẩu không khớp'
        })
        setIsLoading(false)
        return
      }

      // Cập nhật mật khẩu trong Firebase
      if (userId) {
        console.log('Đang cập nhật mật khẩu cho user ID:', userId)

        // Kiểm tra document tồn tại
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          throw new Error(`Document với ID ${userId} không tồn tại`)
        }

        // Cập nhật mật khẩu
        await updateDoc(userRef, {
          password: formData.newPassword
        })

        console.log('Đã cập nhật mật khẩu trong Firestore')

        // Cập nhật currentUser
        setCurrentUser((prev: any) => ({
          ...prev,
          password: formData.newPassword
        }))

        toast({
          title: 'Thành công',
          description: 'Mật khẩu đã được cập nhật trong cơ sở dữ liệu'
        })

        // Đặt lại form
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        throw new Error('Không có ID người dùng để cập nhật')
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật mật khẩu:', error)
      setError(`Lỗi khi cập nhật mật khẩu: ${error.message}`)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật mật khẩu: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!currentUser) {
        setError('Không tìm thấy thông tin người dùng.')
        setIsLoading(false)
        return
      }

      // Cập nhật cài đặt bảo mật trong Firebase
      if (userId) {
        console.log('Đang cập nhật cài đặt bảo mật cho user ID:', userId)

        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          twoFactorEnabled: formData.twoFactorEnabled,
          sessionTimeout: formData.sessionTimeout
        })

        console.log('Đã cập nhật cài đặt bảo mật trong Firestore')

        // Cập nhật currentUser
        setCurrentUser((prev: any) => ({
          ...prev,
          twoFactorEnabled: formData.twoFactorEnabled,
          sessionTimeout: formData.sessionTimeout
        }))

        toast({
          title: 'Thành công',
          description: 'Cài đặt bảo mật đã được cập nhật trong cơ sở dữ liệu'
        })
      } else {
        throw new Error('Không có ID người dùng để cập nhật')
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật cài đặt bảo mật:', error)
      setError(`Lỗi khi cập nhật cài đặt bảo mật: ${error.message}`)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật cài đặt bảo mật: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!currentUser) {
        setError('Không tìm thấy thông tin người dùng.')
        setIsLoading(false)
        return
      }

      // Cập nhật thông tin hồ sơ trong Firebase
      if (userId) {
        console.log('Đang cập nhật thông tin hồ sơ cho user ID:', userId)

        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          fullName: profileData.fullName,
          email: profileData.email,
          department: profileData.department,
          phone: profileData.phone,
          position: profileData.position,
          bio: profileData.bio
          // Không cập nhật role và username vì đây là thông tin quan trọng
        })

        console.log('Đã cập nhật thông tin hồ sơ trong Firestore')

        // Cập nhật currentUser
        setCurrentUser((prev: any) => ({
          ...prev,
          fullName: profileData.fullName,
          email: profileData.email,
          department: profileData.department,
          phone: profileData.phone,
          position: profileData.position,
          bio: profileData.bio
        }))

        // Cập nhật localStorage
        localStorage.setItem(
          'username',
          profileData.fullName || profileData.username
        )
        localStorage.setItem('userDepartment', profileData.department)

        toast({
          title: 'Thành công',
          description: 'Thông tin hồ sơ đã được cập nhật trong cơ sở dữ liệu'
        })
      } else {
        throw new Error('Không có ID người dùng để cập nhật')
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin hồ sơ:', error)
      setError(`Lỗi khi cập nhật thông tin hồ sơ: ${error.message}`)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật thông tin hồ sơ: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin người dùng...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentUser && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Xem và cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profileData.avatarUrl || '/placeholder.svg'}
                      alt={profileData.fullName}
                    />
                    <AvatarFallback className="text-2xl">
                      {profileData.fullName?.charAt(0) ||
                        profileData.username?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      {profileData.fullName || profileData.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profileData.role}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" /> Thay đổi ảnh đại diện
                  </Button>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Tên đăng nhập
                      </Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tên đăng nhập không thể thay đổi
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) =>
                          handleProfileChange('fullName', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" /> Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileChange('email', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" /> Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleProfileChange('phone', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="flex items-center gap-2"
                      >
                        <Building className="h-4 w-4" /> Phòng ban
                      </Label>
                      <Select
                        value={profileData.department}
                        onValueChange={(value) =>
                          handleProfileChange('department', value)
                        }
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Chọn phòng ban">
                            {departmentNames[profileData.department] ||
                              profileData.department ||
                              'Chọn phòng ban'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Không có phòng ban
                          </SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="position"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" /> Chức vụ
                      </Label>
                      <Input
                        id="position"
                        value={profileData.position}
                        onChange={(e) =>
                          handleProfileChange('position', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Giới thiệu
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        handleProfileChange('bio', e.target.value)
                      }
                      rows={4}
                      placeholder="Giới thiệu ngắn về bản thân..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cập nhật thông tin
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <Card>
              <form onSubmit={handlePasswordSubmit}>
                <CardHeader>
                  <CardTitle>Thay đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Cập nhật mật khẩu của bạn để bảo mật tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange('currentPassword', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        handleInputChange('newPassword', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cập nhật mật khẩu
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <form onSubmit={handleSecuritySubmit}>
                <CardHeader>
                  <CardTitle>Bảo mật tài khoản</CardTitle>
                  <CardDescription>
                    Cài đặt bảo mật cho tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactor">Xác thực hai yếu tố</Label>
                      <p className="text-sm text-muted-foreground">
                        Bật xác thực hai yếu tố để tăng cường bảo mật cho tài
                        khoản của bạn
                      </p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        handleInputChange('twoFactorEnabled', checked)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Thời gian hết phiên (phút)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.sessionTimeout}
                      onChange={(e) =>
                        handleInputChange(
                          'sessionTimeout',
                          Number.parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Thời gian không hoạt động trước khi tự động đăng xuất
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Lưu cài đặt
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
