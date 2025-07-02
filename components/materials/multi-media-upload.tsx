"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, ImageIcon, Video, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface MediaFile {
  url: string
  type: "image" | "video"
  name?: string
  size?: number
  duration?: number
}

interface MultiMediaUploadProps {
  media?: MediaFile[]
  onMediaChange: (media: MediaFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedImageTypes?: string[]
  acceptedVideoTypes?: string[]
  disabled?: boolean
  className?: string
}

export function MultiMediaUpload({
  media = [],
  onMediaChange,
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  acceptedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  acceptedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"],
  disabled = false,
  className,
}: MultiMediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allAcceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes]

  // Simulate file upload (replace with actual upload logic)
  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          // Return a mock URL - replace with actual upload URL
          resolve(URL.createObjectURL(file))
        }
      }, 100)
    })
  }

  const getMediaType = (file: File): "image" | "video" => {
    return acceptedImageTypes.includes(file.type) ? "image" : "video"
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (files: FileList) => {
    if (disabled || !files.length) return

    const validFiles = Array.from(files).filter((file) => {
      if (!allAcceptedTypes.includes(file.type)) {
        alert(`Loại file không được hỗ trợ: ${file.type}`)
        return false
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File quá lớn: ${file.name}. Kích thước tối đa: ${maxFileSize}MB`)
        return false
      }
      return true
    })

    if (media.length + validFiles.length > maxFiles) {
      alert(`Chỉ có thể tải lên tối đa ${maxFiles} file`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const newMediaFiles: MediaFile[] = []

      for (const file of validFiles) {
        const url = await uploadFile(file)
        const type = getMediaType(file)
        let duration: number | undefined

        if (type === "video") {
          duration = await getVideoDuration(file)
        }

        newMediaFiles.push({
          url,
          type,
          name: file.name,
          size: file.size,
          duration,
        })
      }

      onMediaChange([...media, ...newMediaFiles])
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Có lỗi xảy ra khi tải file")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index)
    onMediaChange(newMedia)
  }

  const toggleVideoPlay = (url: string, videoElement: HTMLVideoElement) => {
    if (playingVideos.has(url)) {
      videoElement.pause()
      setPlayingVideos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    } else {
      videoElement.play()
      setPlayingVideos((prev) => new Set(prev).add(url))
    }
  }

  const toggleVideoMute = (url: string, videoElement: HTMLVideoElement) => {
    if (mutedVideos.has(url)) {
      videoElement.muted = false
      setMutedVideos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    } else {
      videoElement.muted = true
      setMutedVideos((prev) => new Set(prev).add(url))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allAcceptedTypes.join(",")}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Kéo thả file vào đây hoặc click để chọn</p>
        <p className="text-sm text-gray-500 mb-4">
          Hỗ trợ hình ảnh (JPG, PNG, GIF, WebP) và video (MP4, WebM, OGG, AVI, MOV)
        </p>
        <p className="text-xs text-gray-400">
          Tối đa {maxFiles} file, mỗi file không quá {maxFileSize}MB
        </p>

        {uploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Đang tải lên... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                {item.type === "image" ? (
                  <div className="relative aspect-square">
                    <Image
                      src={item.url || "/placeholder.svg"}
                      alt={item.name || `Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      IMG
                    </Badge>
                  </div>
                ) : (
                  <div className="relative aspect-square bg-black">
                    <video
                      ref={(el) => {
                        if (el) {
                          el.onended = () => {
                            setPlayingVideos((prev) => {
                              const newSet = new Set(prev)
                              newSet.delete(item.url)
                              return newSet
                            })
                          }
                        }
                      }}
                      className="w-full h-full object-cover"
                      muted={mutedVideos.has(item.url)}
                    >
                      <source src={item.url} />
                      Trình duyệt không hỗ trợ video
                    </video>

                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            const video = e.currentTarget
                              .closest(".relative")
                              ?.querySelector("video") as HTMLVideoElement
                            if (video) toggleVideoPlay(item.url, video)
                          }}
                        >
                          {playingVideos.has(item.url) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            const video = e.currentTarget
                              .closest(".relative")
                              ?.querySelector("video") as HTMLVideoElement
                            if (video) toggleVideoMute(item.url, video)
                          }}
                        >
                          {mutedVideos.has(item.url) ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Badge variant="secondary" className="absolute top-2 left-2">
                      <Video className="h-3 w-3 mr-1" />
                      {item.duration ? formatDuration(item.duration) : "VIDEO"}
                    </Badge>
                  </div>
                )}

                {/* File Info */}
                {(item.name || item.size) && (
                  <div className="p-2 bg-gray-50">
                    {item.name && (
                      <p className="text-xs font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                    )}
                    {item.size && <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>}
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeMedia(index)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Media Count */}
      {media.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {media.length} / {maxFiles} file
          </span>
          <span>
            {media.filter((m) => m.type === "image").length} hình ảnh, {media.filter((m) => m.type === "video").length}{" "}
            video
          </span>
        </div>
      )}
    </div>
  )
}
