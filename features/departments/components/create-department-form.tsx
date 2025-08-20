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
import { useGetUserNoDepartmentsQuery } from "@/features/users/hooks/useUsersQuery";

export function CreateDepartmentForm({
  onDepartmentAdded,
}: {
  onDepartmentAdded?: () => void;
}) {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<CreateDepartmentInputType>({
      defaultValues: {
        description: "",
        headId: undefined,
        name: "",
        memberIds: [],
      },
      resolver: zodResolver(createDepartmentInputSchema),
    });

  const selected = watch("memberIds");
  const headSelected = watch("headId");
  const { toast } = useToast();

  const toggleUser = (id: number, checked: boolean) =>
    setValue(
      "memberIds",
      checked ? [...selected, id] : selected.filter((v) => v !== id)
    );

  const { mutate, isPending, error } = useCreateDepartmentMutation();

  const onSubmit: SubmitHandler<CreateDepartmentInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Phòng ban đã được tạo thành công.",
        });
        reset();
        if (onDepartmentAdded) {
          onDepartmentAdded();
        }
      },
    });
  };

  const { data: users } = useGetUserNoDepartmentsQuery();

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

      return true;
    }) ?? [];

  // useResetOnFormChange(watch, resetMutationStatus);

  return (
    <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
      <div className="space-y-6 pr-4">
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
                "Tạo Phòng Ban"
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </ScrollArea>
  );
}
