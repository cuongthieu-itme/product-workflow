"use client";

import React, { useEffect, useState } from "react";
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";

export type ImageUploadProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  className?: string;
  maxFiles?: number;
};

export const ImageUpload = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label = "Hình ảnh",
  className = "",
  maxFiles = 5,
}: ImageUploadProps<T>) => {
  const {
    field: { value = [], onChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  // ----- PREVIEW -----
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate / cleanup object-URLs
  useEffect(() => {
    const files = value as File[];
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    // cleanup
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [value]);

  // ----- DROPZONE -----
  const onDrop = (accepted: FileWithPath[]) => {
    const valid = accepted.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    if (!valid.length) return;

    const next = [...(value as File[]), ...valid].slice(0, maxFiles);
    onChange(next); // react-hook-form update
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles,
  });

  // ----- REMOVE -----
  const removeAt = (idx: number) => {
    const next = (value as File[]).filter((_, i) => i !== idx);
    onChange(next);
  };

  // ----- UI -----
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Kéo thả hoặc chọn ảnh
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {value.length >= maxFiles
                  ? `Đã đạt giới hạn ${maxFiles} ảnh`
                  : "Kéo thả ảnh hoặc nhấp để chọn"}
              </p>
            </div>
            <Input {...getInputProps()} className="hidden" />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => removeAt(i)}
                    className="absolute top-1 right-1 h-6 w-6 bg-destructive hover:bg-destructive/90 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
};
