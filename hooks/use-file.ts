import {
  deleteFile,
  deleteMultipleFiles,
  uploadFile,
  uploadMultipleFiles,
} from "@/apis/form";

import { useToast } from "@/components/ui/use-toast";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

type FileAction = "upload" | "uploadMultiple" | "delete" | "deleteMultiple";

const actionMap = {
  upload: uploadFile,
  uploadMultiple: uploadMultipleFiles,
  delete: deleteFile,
  deleteMultiple: deleteMultipleFiles,
} as const;

/**
 * Hook duy nhất để thực hiện 4 thao tác file:
 * - "upload"            → upload 1 file
 * - "uploadMultiple"    → upload nhiều file
 * - "delete"            → xoá 1 file
 * - "deleteMultiple"    → xoá nhiều file
 *
 * Ví dụ:
 * ```ts
 * const { mutate, isLoading } = useFileMutation("uploadMultiple");
 * mutate(formData);
 * ```
 */
export const useFileMutation = <TData = unknown, TError = Error>(
  action: FileAction
): UseMutationResult<
  TData,
  TError,
  Parameters<(typeof actionMap)[FileAction]>[0]
> => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: actionMap[action] as any,
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Đã xảy ra lỗi",
      });
    },
  });
};
