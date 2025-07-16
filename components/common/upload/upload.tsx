"use client";

import React, { useEffect, useState } from "react";
import {
  useController,
  type UseControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import type { Accept, FileWithPath } from "react-dropzone";
import { getImageUrl } from "@/features/settings/utils";
import { useFileMutation } from "@/hooks/use-file";
import { FileType } from "@/types/common";
import { useToast } from "../../ui/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PreviewFileItem } from "./preview";
import { FileTypeGen, generateTypeFile } from "./helper";

export type UploadFileProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  className?: string;
  maxFiles?: number;
  accept?: Accept;
};

export const UploadFile = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label = "Hình ảnh",
  className = "",
  maxFiles = 5,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
}: UploadFileProps<T>) => {
  const { toast } = useToast();
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

  // ----- DND SENSORS -----
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ----- PREVIEW -----
  const [previews, setPreviews] = useState<
    Array<{
      src: string;
      typeFile: FileTypeGen;
    }>
  >([]);
  const { mutate: uploadMultipleFilesMutation } =
    useFileMutation("uploadMultiple");
  const { mutate: deleteFileMutation } = useFileMutation("delete");

  // // Generate / cleanup object-URLs
  // useEffect(() => {
  //   if (!Array.isArray(value)) return;

  //   const urls = value as string[];
  //   setPreviews(urls);

  //   return () => urls.forEach((u) => URL.revokeObjectURL(u));
  // }, [value]);

  // ----- DROPZONE -----
  const onDrop = async (accepted: FileWithPath[]) => {
    if (value.length >= maxFiles) {
      toast({
        title: "Lỗi",
        description: `Bạn chỉ có thể tải lên tối đa ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    uploadMultipleFilesMutation(accepted, {
      onSuccess: (data) => {
        const next = [
          ...(value as string[]),
          ...(data as FileType[]).map((f) => f.filename),
        ].slice(0, maxFiles);
        onChange(next);
        setPreviews(
          next.map((src) => ({
            src: getImageUrl(src),
            typeFile: generateTypeFile(src),
          }))
        );
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  // ----- DRAG AND DROP -----
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = previews.findIndex(
        (_, index) => `file-${index}` === active.id
      );
      const newIndex = previews.findIndex(
        (_, index) => `file-${index}` === over?.id
      );

      const newImages = arrayMove(value, oldIndex, newIndex);
      onChange(newImages);
      setPreviews(
        arrayMove(previews, oldIndex, newIndex).map((item, index) => ({
          ...item,
          src: getImageUrl(newImages[index]),
        }))
      );
    }
  };

  // ----- REMOVE -----
  const removeAt = async (idx: number) => {
    deleteFileMutation(value[idx], {
      onSuccess: () => {
        const next = (value as string[]).filter((_, i) => i !== idx);
        setPreviews(previews.filter((_, i) => i !== idx));
        onChange(next);
      },
    });
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
            <div className="flex flex-col items-center gap-2 ">
              <Plus className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {value.length >= maxFiles
                  ? `Đã đạt giới hạn ${maxFiles} ảnh`
                  : "Kéo thả ảnh hoặc nhấp để chọn"}
              </p>
            </div>
            <Input
              {...getInputProps()}
              className="hidden"
              disabled={value.length >= maxFiles}
            />
          </div>

          {/* Previews with Drag and Drop */}
          {previews.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={previews.map((_, index) => `file-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {previews.map(({ src, typeFile }, i) => (
                    <PreviewFileItem
                      key={`file-${i}`}
                      id={`file-${i}`}
                      src={src}
                      index={i}
                      onRemove={removeAt}
                      typeFile={typeFile}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
};
