import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";
import { toRequestFormInput } from "@/features/requests/helpers";
import { MediaInputType, mediaSchema } from "@/features/requests/schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadFile } from "@/components/common/upload";
import {
  useUpdateMediaMutation,
  useUpdateRequestMutation,
} from "@/features/requests/hooks/useRequest";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { checkRole } from "@/helpers/getAdminRole";

export const ImageTab = () => {
  const { data: request } = useGetRequestDetailQuery();
  const { data: user } = useGetUserInfoQuery();
  const { control, handleSubmit } = useForm<MediaInputType>({
    defaultValues: {
      media: request?.media || [],
    },
    resolver: zodResolver(mediaSchema),
  });

  const { toast } = useToast();
  const { mutate, isPending } = useUpdateMediaMutation();
  const isAdmin = checkRole(user?.role);
  const isCreator = request?.createdById === user?.id;

  const updateRequestImages: SubmitHandler<MediaInputType> = (data) => {
    if (!request) return;
    if (!isAdmin || !isCreator) {
      toast({
        title: "Bạn không có quyền cập nhật hình ảnh",
        description: "Chỉ người tạo yêu cầu mới có thể cập nhật hình ảnh.",
        variant: "destructive",
      });
      return;
    }

    mutate(
      {
        id: request.id,
        media: data.media,
      },
      {
        onSuccess: () => {
          toast({
            title: "Cập nhật hình ảnh, video thành công",
            description: "Hình ảnh, video yêu cầu đã được cập nhật.",
          });
        },
        onError: (error) => {
          toast({
            title: "Cập nhật hình ảnh, video thất bại",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <TabsContent value="images">
      <form noValidate onSubmit={handleSubmit(updateRequestImages)}>
        <Card className="h-full">
          <CardHeader className="pt-4 pb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">
                Hình ảnh yêu cầu
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Quản lý hình ảnh liên quan đến yêu cầu này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px]">
              <UploadFile
                control={control}
                name="media"
                hideHeader
                previewClasses="w-48 h-48"
                disabled={true}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/webp": [".webp"],
                  "video/mp4": [".mp4"],
                  "video/quicktime": [".mov"],
                  "video/x-msvideo": [".avi"],
                  "video/x-ms-wmv": [".wmv"],
                  "video/3gpp": [".3gp"],
                  "video/3gpp2": [".3g2"],
                  "video/mp2t": [".ts"],
                  "video/ogg": [".ogv"],
                  "video/webm": [".webm"],
                }}
              />
            </ScrollArea>

            <div className="px-6 pb-6 flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !isAdmin || !isCreator}
              >
                {isPending ? "Đang cập nhật" : "Cập nhật film ảnh, video"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </TabsContent>
  );
};
