"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { DatePicker } from "../ui/date-picker"
import { useCustomers } from "./customer-context"
import { useRouter } from "next/navigation"

interface CustomerFormProps {
  onSuccess?: () => void
  customerId?: string
}

export function CustomerForm({ onSuccess, customerId }: CustomerFormProps) {
  const {
    addCustomer,
    updateCustomer,
    getCustomerById,
    customerSources,
    addCustomerSource,
    checkPhoneExists,
    checkEmailExists,
  } = useCustomers()
  const router = useRouter()

  const initialCustomer = customerId ? getCustomerById(customerId) : null

  const [name, setName] = useState(initialCustomer?.name || "")
  const [phone, setPhone] = useState(initialCustomer?.phone || "")
  const [email, setEmail] = useState(initialCustomer?.email || "")
  const [source, setSource] = useState(initialCustomer?.source || "")
  const [gender, setGender] = useState(initialCustomer?.gender || "")
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialCustomer?.birthDate ? new Date(initialCustomer.birthDate) : undefined,
  )
  const [newSource, setNewSource] = useState("")
  const [showSourceDialog, setShowSourceDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")

  const handleAddSource = () => {
    if (newSource.trim()) {
      addCustomerSource(newSource.trim())
      setSource(newSource.trim())
      setNewSource("")
      setShowSourceDialog(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      console.log("🚀 Submitting customer data:", { name, phone, email, source, gender, birthDate })

      // Kiểm tra trùng số điện thoại
      if (!customerId) {
        const phoneExists = await checkPhoneExists(phone)
        if (phoneExists) {
          setError(`Số điện thoại ${phone} đã tồn tại trong hệ thống`)
          return
        }
      } else {
        const phoneExists = await checkPhoneExists(phone, customerId)
        if (phoneExists) {
          setError(`Số điện thoại ${phone} đã tồn tại trong hệ thống`)
          return
        }
      }

      // Kiểm tra trùng email nếu có email
      if (email.trim()) {
        if (!customerId) {
          const emailExists = await checkEmailExists(email)
          if (emailExists) {
            setError(`Email ${email} đã tồn tại trong hệ thống`)
            return
          }
        } else {
          const emailExists = await checkEmailExists(email, customerId)
          if (emailExists) {
            setError(`Email ${email} đã tồn tại trong hệ thống`)
            return
          }
        }
      }

      const customerData = {
        name,
        phone,
        email,
        source,
        gender,
        birthDate: birthDate ? birthDate.toISOString() : undefined,
      }

      if (customerId) {
        await updateCustomer(customerId, customerData)
        console.log("✅ Customer updated successfully")
      } else {
        await addCustomer(customerData)
        console.log("✅ Customer added successfully")
      }

      // Reset form nếu là thêm mới
      if (!customerId) {
        setName("")
        setPhone("")
        setEmail("")
        setSource("")
        setGender("")
        setBirthDate(undefined)
      }

      if (onSuccess) {
        onSuccess()
      } else if (!customerId) {
        // Điều hướng về danh sách khách hàng sau khi thêm thành công
        router.push("/dashboard/customers")
      }
    } catch (error) {
      console.error("❌ Error saving customer:", error)
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu khách hàng")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Họ tên khách hàng <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập họ tên khách hàng"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Số điện thoại <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Nguồn khách hàng</Label>
        <div className="flex gap-2">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn nguồn khách hàng" />
            </SelectTrigger>
            <SelectContent>
              {customerSources.map((src) => (
                <SelectItem key={src} value={src}>
                  {src}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm nguồn khách hàng mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newSource">Tên nguồn</Label>
                  <Input
                    id="newSource"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Nhập tên nguồn khách hàng"
                  />
                </div>
                <Button type="button" onClick={handleAddSource}>
                  Thêm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Giới tính</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Nam</SelectItem>
            <SelectItem value="female">Nữ</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Ngày sinh</Label>
        <DatePicker date={birthDate} setDate={setBirthDate} />
      </div>

      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Đang xử lý..." : customerId ? "Cập nhật" : "Thêm khách hàng"}
      </Button>
    </form>
  )
}
