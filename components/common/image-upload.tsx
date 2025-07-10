"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Control } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { FileWithPath } from "react-dropzone";

type ImageUploadProps<T extends FieldValues> = {
  name: string;
  control: Control<T, any>;
  label?: string;
  className?: string;
  error?: string;
};

export const ImageUpload = <T extends FieldValues>({
  name,
  control,
  label,
  className,
  error,
}: ImageUploadProps<T>) => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const onDrop = (acceptedFiles: FileWithPath[]) => {
    const validFiles = acceptedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    const currentFiles = (control.formState.values[name] as File[]) || [];
    const newFiles = [...currentFiles, ...validFiles];
    control.setValue(name, newFiles.slice(0, 5));

    // Update preview images
    setPreviewImages((prev) =>
      [...prev, ...validFiles.map((file) => URL.createObjectURL(file))].slice(
        0,
        5
      )
    );
  };

  const handleRemoveImage = (index: number) => {
    const currentFiles = (control.formState.values[name] as File[]) || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    control.setValue(name, newFiles);

    // Clean up preview image
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 5,
  });

  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={name}>{label || "Hình ảnh"}</Label>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Kéo thả hoặc chọn ảnh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {previewImages.length === 5
                  ? "Đã đạt giới hạn 5 ảnh"
                  : "Kéo thả ảnh hoặc nhấp để chọn"}
              </p>
            </div>
            <Input {...getInputProps()} className="hidden" />
          </div>

          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
