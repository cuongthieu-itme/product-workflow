'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Plus } from 'lucide-react'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'

interface MultiImageUploadProps {
  initialImages?: string[]
  onImagesChange?: (images: string[]) => void
  onChange?: (images: string[]) => void
  images?: string[]
  maxImages?: number
}

export function MultiImageUpload({
  initialImages = [],
  onImagesChange,
  onChange,
  images: propImages,
  maxImages = 5
}: MultiImageUploadProps) {
  // Sử dụng images từ props nếu có, nếu không thì dùng initialImages
  const [images, setImages] = useState<string[]>(propImages || initialImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hàm xử lý thay đổi hình ảnh
  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
    // Gọi cả hai callback nếu có
    if (onImagesChange) onImagesChange(newImages)
    if (onChange) onChange(newImages)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Kiểm tra số lượng hình ảnh tối đa
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Lỗi',
        description: `Bạn chỉ có thể tải lên tối đa ${maxImages} hình ảnh`,
        variant: 'destructive'
      })
      return
    }

    // Xử lý từng file
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        handleImagesChange([...images, result])
      }
      reader.readAsDataURL(file)
    })

    // Reset input để có thể chọn lại cùng một file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    handleImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-32 border rounded-md overflow-hidden"
          >
            <Image
              src={
                image || '/placeholder.svg?height=200&width=200&query=preview'
              }
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = '/generic-preview-screen.png'
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Thêm hình ảnh</p>
            <p className="text-xs text-gray-400 mt-1">
              {images.length}/{maxImages}
            </p>
          </div>
        )}
      </div>

      {images.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-8 w-full h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Nhấp để tải lên hình ảnh</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
          <p className="text-xs text-gray-400 mt-1">
            Tối đa {maxImages} hình ảnh ({images.length}/{maxImages})
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />
    </div>
  )
}
