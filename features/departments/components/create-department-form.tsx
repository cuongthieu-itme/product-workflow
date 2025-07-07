"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  createDepartmentInputSchema,
  CreateDepartmentInputType,
} from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDepartmentMutation } from "../hooks";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { SelectCustom } from "@/components/form/select";
import { useUsersQuery } from "@/features/users/hooks";
import { useResetOnFormChange } from "@/hooks/use-reset-form-change";
import { DepartmentType } from "../type";

export function CreateDepartmentForm({
  onDepartmentAdded,
}: {
  onDepartmentAdded?: () => void;
}) {
  const { control, handleSubmit, reset, watch } =
    useForm<CreateDepartmentInputType>({
      defaultValues: {
        description: "",
        headId: undefined,
        name: "",
      },
      resolver: zodResolver(createDepartmentInputSchema),
    });

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    reset: resetMutationStatus,
  } = useCreateDepartmentMutation();

  const onSubmit: SubmitHandler<CreateDepartmentInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        if (onDepartmentAdded) {
          onDepartmentAdded();
        }
      },
    });
  };

  const { data: users } = useUsersQuery();
  const userOptions =
    users?.data.map((user) => ({
      value: user.id,
      label: `${user.fullName} (${user.userName})`,
    })) || [];

  useResetOnFormChange(watch, resetMutationStatus);

  return (
    <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
      <div className="space-y-6 pr-4">
        {isSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Tạo phòng ban thành công!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Phòng ban đã được tạo thành công và đã được thêm vào hệ thống.
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
              name="headId"
              control={control}
              label="Trưởng Phòng Ban"
              options={userOptions}
              required
              placeholder="Chọn trưởng phòng ban"
            />

            {/* <div className="space-y-2">
              <Label className="text-sm font-medium">
                Thành Viên Phòng Ban
              </Label>
              <div className="border rounded-md p-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUsers.length > 0 ? (
                    selectedUsers.map((userId) => {
                      const user = users.find((u) => u.id === userId);
                      return user ? (
                        <Badge
                          key={userId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {user.fullName}
                          <button
                            type="button"
                            onClick={() => handleUserSelect(userId, false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có thành viên nào được chọn
                    </p>
                  )}
                </div>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2 pr-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) =>
                            handleUserSelect(user.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {user.fullName} ({user.username})
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div> */}
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
                "Tạo Phòng Ban"
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </ScrollArea>
  );
}
