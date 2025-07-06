"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SubmitHandler, useForm } from "react-hook-form";
import { createUserInputSchema, CreateUserInputType } from "../schema";
import { UserRoleEnum } from "@/features/auth/constants";
import { InputCustom } from "@/components/form/input";
import { SelectCustom } from "@/components/form/select";
import { useCreateUserMutation } from "../hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRoles } from "../options";
import { useResetOnFormChange } from "@/hooks/use-reset-form-change";

// Danh sách username bị cấm (trừ khi role là admin)
const RESERVED_USERNAMES = ["admin", "administrator", "root", "system"];

interface Department {
  id: string;
  name: string;
  description: string;
}

export function AddUserForm() {
  const { control, handleSubmit, watch, reset } = useForm<CreateUserInputType>({
    defaultValues: {
      userName: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: UserRoleEnum.USER,
      departmentCode: "",
      phoneNumber: "",
    },
    resolver: zodResolver(createUserInputSchema),
  });

  const {
    mutate,
    isPending,
    error,
    isSuccess,
    reset: resetMutationState,
  } = useCreateUserMutation();

  const onSubmit: SubmitHandler<CreateUserInputType> = async (data) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // Kiểm tra kết nối Firebase và lấy danh sách phòng ban khi component được tải
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Thử truy cập collection để kiểm tra kết nối
        const testQuery = collection(db, "users");
        await getDocs(query(testQuery, limit(1)));
        console.log("Firebase connection successful");

        // Lấy danh sách phòng ban từ Firestore
        await fetchDepartments();
      } catch (error) {
        console.error("Lỗi kết nối Firebase:", error);
      }
    };

    checkFirebaseConnection();
  }, []);

  // Hàm lấy danh sách phòng ban từ Firestore
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    setDepartmentError(null);

    try {
      console.log("Đang lấy danh sách phòng ban từ Firestore...");
      const departmentsCollection = collection(db, "departments");
      const departmentsSnapshot = await getDocs(departmentsCollection);

      if (departmentsSnapshot.empty) {
        console.log("Không có phòng ban nào trong Firestore");
        setDepartments([]);
      } else {
        // Lấy dữ liệu từ Firestore
        const departmentsData = departmentsSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
          } as Department;
        });
        console.log(
          "Đã lấy được",
          departmentsData.length,
          "phòng ban từ Firestore"
        );
        setDepartments(departmentsData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng ban:", error);
      setDepartmentError(
        `Lỗi khi lấy danh sách phòng ban: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      // Sử dụng dữ liệu từ localStorage nếu có lỗi
      try {
        if (typeof window !== "undefined") {
          const storedDepartments = JSON.parse(
            localStorage.getItem("departments") || "[]"
          );
          const simplifiedDepartments = storedDepartments.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            description: dept.description,
          }));
          setDepartments(simplifiedDepartments);
          console.log("Đã sử dụng dữ liệu từ localStorage do lỗi Firestore");
        }
      } catch (localError) {
        console.error("Lỗi khi lấy dữ liệu từ localStorage:", localError);
      }
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Reset form khi có thay đổi
  useResetOnFormChange(watch, resetMutationState);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {departmentError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{departmentError}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Thành công!</AlertTitle>
          <AlertDescription className="text-green-700">
            Tài khoản đã được tạo thành công.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            disabled={isPending}
            control={control}
            name="fullName"
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="userName"
            label="Tên đăng nhập"
            placeholder="username"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="email"
            label="Email"
            placeholder="name@example.com"
            required
          />

          <InputCustom
            disabled={isPending}
            control={control}
            name="phoneNumber"
            label="Số điện thoại"
            placeholder="0912345678"
          />

          <SelectCustom
            control={control}
            disabled={isPending}
            name="role"
            label="Vai trò"
            options={userRoles}
            placeholder="Chọn vai trò"
            required
          />

          <SelectCustom
            control={control}
            name="departmentCode"
            label="Phòng ban"
            options={departments.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            emptyOption={{ label: "Không có phòng ban" }}
            placeholder="Chọn phòng ban"
            required
            disabled={isPending || loadingDepartments}
          />

          <InputCustom
            control={control}
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            type="password"
            required
          />

          <InputCustom
            control={control}
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            type="password"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang tạo..." : "Tạo người dùng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
