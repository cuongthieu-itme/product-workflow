"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  updateDepartmentInputSchema,
  UpdateDepartmentInputType,
} from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateDepartmentMutation } from "../hooks";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { useUsersQuery } from "@/features/users/hooks";
import { DepartmentType } from "../type";
import { BaseDialog } from "@/components/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

export function UpdateDepartmentForm({
  onDepartmentAdded,
  department,
  open,
  onClose,
}: {
  onDepartmentAdded?: () => void;
  department: DepartmentType | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<UpdateDepartmentInputType>({
      defaultValues: {
        id: department?.id,
        description: department?.description || "",
        headId: department?.headId,
        name: department?.name || "",
        memberIds: department?.members.map((m) => m.id) || [],
      },
      resolver: zodResolver(updateDepartmentInputSchema),
    });

  const selected = watch("memberIds");
  const headSelected = watch("headId");

  const toggleUser = (id: number, checked: boolean) =>
    setValue(
      "memberIds",
      checked ? [...selected, id] : selected.filter((v) => v !== id)
    );

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    data,
    // reset: resetMutationStatus,
  } = useUpdateDepartmentMutation();
  const { data: users } = useUsersQuery();

  const onSubmit: SubmitHandler<UpdateDepartmentInputType> = (data) => {
    if (!department?.id) return;

    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Phòng ban đã được cập nhật thành công.",
        });
        onClose();
        reset();
        if (onDepartmentAdded) {
          onDepartmentAdded();
        }
      },
    });
  };

  // If selected have headId, remove it from headOptions
  const headOptions =
    users?.data
      ?.map((user) => ({
        value: user.id,
        label: `${user.fullName} (${user.userName})`,
      }))
      .filter((user) => !selected.includes(Number(user.value))) ?? [];

  const memberOptions =
    users?.data?.filter((user) => {
      if (headSelected) {
        return Number(user.id) !== headSelected;
      }
    }) ?? [];

  // useResetOnFormChange(watch, resetMutationStatus);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Cập nhật phòng ban"
      description="Điền thông tin để cập nhật phòng ban. Nhấn nút Cập nhật khi hoàn tất."
    >
      <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
        <div className="space-y-6 pr-4">
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Cập nhật thành công!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {data.message || "Phòng ban đã được cập nhật thành công."}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-4">
              <InputCustom
                control={control}
                name="name"
                label="Tên Phòng Ban"
                placeholder="Nhập tên phòng ban"
                required
              />

              <TextAreaCustom
                control={control}
                name="description"
                label="Mô Tả"
                placeholder="Nhập mô tả phòng ban"
                required
              />

              <SelectCustom
                valueType="number"
                name="headId"
                control={control}
                label="Trưởng Phòng Ban"
                options={headOptions}
                required
                placeholder="Chọn trưởng phòng ban"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Thành Viên Phòng Ban
                </Label>

                <div className="border rounded-md p-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selected.length ? (
                      selected.map((id) => {
                        const user = users?.data.find(
                          (u) => u.id.toString() === id.toString()
                        );
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.fullName}
                            <button
                              type="button"
                              onClick={() => toggleUser(id, false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa có thành viên nào được chọn
                      </p>
                    )}
                  </div>

                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2 pr-4">
                      {memberOptions.map((u) => (
                        <div key={u.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${u.id}`}
                            checked={selected.includes(Number(u.id))}
                            onCheckedChange={(c) =>
                              toggleUser(Number(u.id), c as boolean)
                            }
                          />
                          <label
                            htmlFor={`user-${u.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {u.fullName} ({u.userName})
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Cập nhật phòng ban"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
