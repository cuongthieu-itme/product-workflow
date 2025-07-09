import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserType } from "@/features/auth/type";
import { User as UserIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import request from "@/configs/axios-config";
import { useToast } from "@/components/ui/use-toast";
import { getRoleName } from "@/helpers";
import { useUpdateAvatarMutation } from "../hooks";
import { getImageUrl } from "../utils";
import { CurrentUserType } from "../type";

interface AvatarSettingProps {
  user: CurrentUserType;
}

export const AvatarSetting = ({ user }: AvatarSettingProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useUpdateAvatarMutation()


  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Upload to server
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await request.post("/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.filename) {
        mutate(response.data.filename)
        toast({
          title: "Thành công",
          description: "Đã thay đổi ảnh đại diện thành công",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tải lên ảnh",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg",],
    },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <div {...getRootProps()} className="w-full justify-center flex">
        <input {...getInputProps()} />
        <Avatar className="h-24 w-24 cursor-pointer relative">
          <AvatarImage src={getImageUrl(user.avatar)} alt={user.fullName} />
          <AvatarFallback className="text-2xl">
            {user.fullName?.charAt(0) || user.userName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold">
          {user.fullName || user.userName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {getRoleName(user.role)}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => {
          const fileInput = document.querySelector(
            'input[type="file"]'
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        }}
        disabled={isLoading}
      >
        <UserIcon className="h-4 w-4" /> Thay đổi ảnh đại diện
      </Button>
    </div>
  );
};
