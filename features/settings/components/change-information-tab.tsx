"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Building, Shield, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputCustom } from "@/components/form/input";
import { AvatarSetting } from "./avatar-setting";
import { useUpdateProfileMutation } from "../hooks";
import { ChangeInfoInputType } from "../schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useGetCurrentUserQuery } from "../hooks/useProfile";
import { getDepartmentRole } from "../utils";

export const ChangeInformationTab = () => {
  const { toast } = useToast();
  const { data: user } = useGetCurrentUserQuery();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ChangeInfoInputType>({
    defaultValues: {
      email: user?.email,
      fullName: user?.fullName,
      phoneNumber: user?.phoneNumber,
      avatar: user?.avatar,
    },
  });

  const { mutate, isPending } = useUpdateProfileMutation();

  const onSubmit: SubmitHandler<ChangeInfoInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin cá nhân thành công",
        });
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error?.message ?? "Cập nhật thông tin cá nhân thất bại",
          variant: "destructive",
        });
      },
    });
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>
          Xem và cập nhật thông tin cá nhân của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarSetting user={user} />

        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="flex items-center gap-2 h-[24px]"
              >
                <User className="h-4 w-4" /> Tên đăng nhập
              </Label>
              <Input
                id="username"
                value={user.userName}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Tên đăng nhập không thể thay đổi
              </p>
            </div>

            <InputCustom
              control={control}
              name="fullName"
              label="Họ và tên"
              labelIcon={<User className="h-4 w-4" />}
            />

            <InputCustom
              control={control}
              name="email"
              label="Email"
              labelIcon={<Mail className="h-4 w-4" />}
            />

            <InputCustom
              control={control}
              name="phoneNumber"
              label="Số điện thoại"
              labelIcon={<Phone className="h-4 w-4" />}
            />

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Phòng ban
              </Label>
              <Input
                id="department"
                value={user?.department?.name ?? "Chưa có phòng ban"}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Chức vụ
              </Label>
              <Input
                id="position"
                value={getDepartmentRole(
                  user.id,
                  user?.department?.headId,
                  user?.department?.id
                )}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cập nhật...
                </>
              ) : (
                "Cập nhật thông tin"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
