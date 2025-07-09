import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitHandler, useForm } from "react-hook-form";
import { ChangePasswordInputType } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordInputSchema } from "../schema";
import { useChangePasswordMutation } from "../hooks";
import { InputCustom } from "@/components/form/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChangePasswordTab = () => {
  const { control, handleSubmit, reset } = useForm<ChangePasswordInputType>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(changePasswordInputSchema),
  });

  const { mutate, isPending } = useChangePasswordMutation();

  const onSubmit: SubmitHandler<ChangePasswordInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Thay đổi mật khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu của bạn để bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputCustom
            control={control}
            name="oldPassword"
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            type="password"
          />

          <InputCustom
            control={control}
            name="newPassword"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            type="password"
          />

          <InputCustom
            control={control}
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            type="password"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật mật khẩu
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
