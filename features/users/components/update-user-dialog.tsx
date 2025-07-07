"use client";
import { BaseDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateUserInputSchema,
  type UpdateUserInputType,
} from "../schema/update-user-schema";
import { User } from "../type";
import { useEffect } from "react";
import { useUpdateUserMutation } from "../hooks";
import { toast } from "sonner";
import { UserRoleEnum } from "@/features/auth/constants";
import { SelectCustom, SelectOption } from "@/components/form/select";
import { useDepartmentsQuery } from "@/features/departments/hooks";

interface UpdateUserDialogProps {
  editingUser: User | null;
  setEditingUser: (u: User | null) => void;
}

export const UpdateUserDialog = ({
  editingUser,
  setEditingUser,
}: UpdateUserDialogProps) => {
  const { control, handleSubmit, reset } = useForm<UpdateUserInputType>({
    resolver: zodResolver(updateUserInputSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      role: UserRoleEnum.USER,
      departmentId: null,
      email: "",
      isVerifiedAccount: "false",
      userName: "",
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
        userName: editingUser.userName,
      });
    }
  }, [editingUser, reset]);

  const { mutateAsync, isPending } = useUpdateUserMutation();

  const onSubmit = async (data: UpdateUserInputType) => {
    if (!editingUser) return;
    try {
      await mutateAsync({ id: editingUser.id, data });
      toast.success("Cập nhật thành công!");
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  const { data: departments } = useDepartmentsQuery();

  const departOptions: SelectOption[] =
    departments?.data.map((d) => ({
      value: d.id,
      label: d.name,
    })) ?? [];

  return (
    <BaseDialog
      open={!!editingUser}
      onClose={() => setEditingUser(null)}
      title="Chỉnh sửa người dùng"
      contentClassName="sm:max-w-[420px]"
      description={`Chỉnh sửa người dùng ${editingUser?.userName || ""}`}
    >
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <InputCustom
            control={control}
            name="userName"
            label="Tên đăng nhập"
            className="flex-1 min-w-[180px]"
            disabled
          />
          <InputCustom
            control={control}
            name="fullName"
            label="Họ tên"
            required
            className="flex-1 min-w-[180px]"
          />
          <InputCustom
            control={control}
            name="email"
            label="Email"
            required
            className="flex-1 min-w-[180px]"
          />
          <InputCustom
            control={control}
            name="phoneNumber"
            label="Số ĐT"
            className="flex-1 min-w-[180px]"
            required
          />
          <SelectCustom
            control={control}
            name="role"
            label="Vai trò"
            required
            options={[
              { value: UserRoleEnum.ADMIN, label: "Admin" },
              { value: UserRoleEnum.USER, label: "User" },
            ]}
          />
          <SelectCustom
            valueType="number"
            control={control}
            name="departmentId"
            label="Phòng ban"
            required
            options={departOptions}
          />

          <SelectCustom
            control={control}
            name="isVerifiedAccount"
            label="Trạng thái"
            required
            options={[
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Vô hiệu hóa" },
            ]}
          />
        </div>
        <div className="flex justify-end pt-2 mt-4">
          <Button type="submit" disabled={isPending}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
};
