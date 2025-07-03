'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  initialImage?: string
  onImageChange: (imageUrl: string) => void
}

export function ImageUpload({ initialImage, onImageChange }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImage || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Trong môi trường thực tế, bạn sẽ tải lên file lên server và nhận về URL
    // Ở đây, chúng ta sẽ tạo một URL tạm thời để hiển thị preview
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreviewUrl(result)
      onImageChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {previewUrl ? (
        <div className="relative w-full h-48">
          <Image
            src={
              previewUrl ||
              '/placeholder.svg?height=200&width=200&query=preview'
            }
            alt="Preview"
            fill
            className="object-contain rounded-md"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = '/generic-preview-screen.png'
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-8 w-full h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Nhấp để tải lên hình ảnh</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
