"use client";

import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/form/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateUserInputSchema,
  type UpdateUserInputType,
} from "../schema/update-user-schema";
import { User } from "../type";
import { useEffect } from "react";
import { useUpdateUserMutation } from "../hooks";
import { UserRoleEnum } from "@/features/auth/constants";
import { SelectCustom, SelectOption } from "@/components/form/select";
import { useDepartmentsQuery } from "@/features/departments/hooks";
import { userRoles, userStatus } from "../options";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UpdateUserDialogProps {
  editingUser: User | null;
  setEditingUser: (u: User | null) => void;
}

export const UpdateUserDialog = ({
  editingUser,
  setEditingUser,
}: UpdateUserDialogProps) => {
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<UpdateUserInputType>({
    resolver: zodResolver(updateUserInputSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      role: UserRoleEnum.USER,
      departmentId: null,
      email: "",
      isVerifiedAccount: "false",
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        fullName: editingUser.fullName ?? "",
        phoneNumber: editingUser.phoneNumber ?? "",
        role: editingUser.role,
        departmentId: editingUser.department?.id,
        email: editingUser.email,
        isVerifiedAccount: editingUser.isVerifiedAccount ? "true" : "false",
      });
    }
  }, [editingUser, reset]);

  const { mutateAsync, isPending } = useUpdateUserMutation();

  const onSubmit = async (data: UpdateUserInputType) => {
    if (!editingUser) return;
    try {
      await mutateAsync({ id: editingUser.id, data });
      toast({
        title: "Thành công",
        description: "Cập nhật thành công!",
      });
      setEditingUser(null);
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Cập nhật thất bại",
        variant: "destructive",
      });
    }
  };

  const { data: departments } = useDepartmentsQuery();

  const departOptions: SelectOption[] =
    departments?.data.map((d) => ({
      value: d.id,
      label: d.name,
    })) ?? [];

  const { data: user } = useGetUserInfoQuery();

  const selectUserOptions: SelectOption[] =
    user?.role === UserRoleEnum.SUPER_ADMIN
      ? userRoles
      : userRoles.filter((r) => r.value !== UserRoleEnum.ADMIN);

  return (
    <BaseDialog
      open={!!editingUser}
      onClose={() => setEditingUser(null)}
      title="Chỉnh sửa người dùng"
      contentClassName="sm:max-w-[420px]"
      description={`Chỉnh sửa người dùng ${editingUser?.userName || ""}`}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 h-[24px]"
            >
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              value={editingUser?.userName}
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
            label="Họ tên"
            required
            className="flex-1 min-w-[180px]"
            disabled={isPending}
          />

          <InputCustom
            control={control}
            name="email"
            label="Email"
            required
            className="flex-1 min-w-[180px]"
            disabled={isPending}
          />

          <InputCustom
            control={control}
            name="phoneNumber"
            label="Số điện thoại"
            className="flex-1 min-w-[180px]"
            disabled={isPending}
          />

          <SelectCustom
            control={control}
            name="role"
            label="Vai trò"
            required
            options={selectUserOptions}
            disabled={isPending}
          />

          <SelectCustom
            valueType="number"
            control={control}
            name="departmentId"
            label="Phòng ban"
            options={departOptions}
            disabled={isPending}
          />

          <SelectCustom
            control={control}
            name="isVerifiedAccount"
            label="Trạng thái"
            required
            options={userStatus}
            disabled={isPending}
          />
        </div>
        <div className="flex justify-end pt-2 mt-4 gap-2">
          <Button variant="outline" onClick={() => setEditingUser(null)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
};
