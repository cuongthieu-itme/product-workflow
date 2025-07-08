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
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

interface AccessRight {
  id: string;
  name: string;
  description: string;
}

export function AddDepartmentForm({
  onDepartmentAdded,
}: {
  onDepartmentAdded?: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    manager: "",
    members: [] as string[],
    accessRights: [] as string[],
  });
  const [idExists, setIdExists] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessRights, setAccessRights] = useState<AccessRight[]>([
    {
      id: "view_all",
      name: "Xem tất cả",
      description: "Quyền xem tất cả dữ liệu",
    },
    {
      id: "edit_all",
      name: "Chỉnh sửa tất cả",
      description: "Quyền chỉnh sửa tất cả dữ liệu",
    },
    { id: "delete", name: "Xóa dữ liệu", description: "Quyền xóa dữ liệu" },
    {
      id: "approve",
      name: "Phê duyệt",
      description: "Quyền phê duyệt yêu cầu",
    },
    {
      id: "export",
      name: "Xuất dữ liệu",
      description: "Quyền xuất dữ liệu ra file",
    },
  ]);

  // Lấy danh sách người dùng từ Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Đang lấy danh sách người dùng từ Firestore...");
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);

        if (!usersSnapshot.empty) {
          const usersData = usersSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          );
          setUsers(usersData);
          console.log(
            "Đã lấy được",
            usersData.length,
            "người dùng từ Firestore"
          );
        } else {
          console.log("Không có người dùng nào trong Firestore");
          // Sử dụng dữ liệu từ localStorage nếu không có dữ liệu trong Firestore
          if (typeof window !== "undefined") {
            const storedUsers = JSON.parse(
              localStorage.getItem("users") || "[]"
            );
            setUsers(storedUsers);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        // Sử dụng dữ liệu từ localStorage nếu có lỗi
        if (typeof window !== "undefined") {
          const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
          setUsers(storedUsers);
        }
      }
    };

    fetchUsers();
  }, []);

  // Tạo ID từ tên phòng ban
  const generateIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "");
  };

  // Kiểm tra ID phòng ban trong Firestore
  const checkDepartmentId = async (id: string) => {
    if (!id) return;

    try {
      console.log("Kiểm tra ID phòng ban trong Firestore:", id);
      const departmentRef = doc(db, "departments", id);
      const departmentSnap = await getDoc(departmentRef);

      const exists = departmentSnap.exists();
      setIdExists(exists);

      if (exists) {
        setErrorMessage(
          "ID phòng ban đã tồn tại trong Firestore. Vui lòng chọn ID khác."
        );
        setShowError(true);
      } else {
        setShowError(false);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra ID phòng ban:", error);
      // Kiểm tra trong localStorage nếu có lỗi
      if (typeof window !== "undefined") {
        const departments = JSON.parse(
          localStorage.getItem("departments") || "[]"
        );
        const existingId = departments.some((d: any) => d.id === id);
        setIdExists(existingId);

        if (existingId) {
          setErrorMessage("ID phòng ban đã tồn tại. Vui lòng chọn ID khác.");
          setShowError(true);
        } else {
          setShowError(false);
        }
      }
    }
  };

  // Kiểm tra tên phòng ban trong Firestore
  const checkDepartmentName = async (name: string) => {
    if (!name) return;

    try {
      console.log("Kiểm tra tên phòng ban trong Firestore:", name);
      const departmentsRef = collection(db, "departments");
      const q = query(departmentsRef, where("name", "==", name.trim()));
      const querySnapshot = await getDocs(q);

      const exists = !querySnapshot.empty;
      setNameExists(exists);

      if (exists) {
        setErrorMessage(
          "Tên phòng ban đã tồn tại trong hệ thống. Vui lòng chọn tên khác."
        );
        setShowError(true);
      } else {
        setShowError(false);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra tên phòng ban:", error);
      // Kiểm tra trong localStorage nếu có lỗi
      if (typeof window !== "undefined") {
        const departments = JSON.parse(
          localStorage.getItem("departments") || "[]"
        );
        const existingName = departments.some(
          (d: any) => d.name.toLowerCase().trim() === name.toLowerCase().trim()
        );
        setNameExists(existingName);

        if (existingName) {
          setErrorMessage("Tên phòng ban đã tồn tại. Vui lòng chọn tên khác.");
          setShowError(true);
        } else {
          setShowError(false);
        }
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowSuccess(false);

    if (field === "id") {
      checkDepartmentId(value);
    }

    if (field === "name") {
      const trimmedName = value.trim();
      checkDepartmentName(trimmedName);
      // Tự động tạo ID từ tên
      const generatedId = generateIdFromName(trimmedName);
      setFormData((prev) => ({ ...prev, id: generatedId }));
      checkDepartmentId(generatedId);
    }
  };

  const handleAccessRightChange = (rightId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, accessRights: [...prev.accessRights, rightId] };
      } else {
        return {
          ...prev,
          accessRights: prev.accessRights.filter((id) => id !== rightId),
        };
      }
    });
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) => {
      if (checked) {
        return [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      manager: "",
      members: [],
      accessRights: [],
    });
    setSelectedUsers([]);
    setShowSuccess(false);
    setShowError(false);
    setIdExists(false);
    setNameExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);

    // Kiểm tra dữ liệu
    if (!formData.id || !formData.name || !formData.description) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setShowError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Kiểm tra ID và tên đã tồn tại trong Firestore chưa
      const departmentRef = doc(db, "departments", formData.id);
      const departmentSnap = await getDoc(departmentRef);

      if (departmentSnap.exists()) {
        setErrorMessage(
          "ID phòng ban đã tồn tại trong Firestore. Vui lòng chọn ID khác."
        );
        setShowError(true);
        setIsLoading(false);
        return;
      }

      // Kiểm tra tên phòng ban trước khi lưu
      const departmentsRef = collection(db, "departments");
      const nameQuery = query(
        departmentsRef,
        where("name", "==", formData.name.trim())
      );
      const nameQuerySnapshot = await getDocs(nameQuery);

      if (!nameQuerySnapshot.empty) {
        setErrorMessage(
          "Tên phòng ban đã tồn tại trong hệ thống. Vui lòng chọn tên khác."
        );
        setShowError(true);
        setIsLoading(false);
        return;
      }

      // Thêm phòng ban mới vào Firestore
      const newDepartment = {
        ...formData,
        members: selectedUsers,
        createdAt: serverTimestamp(),
      };

      console.log("Đang thêm phòng ban mới vào Firestore:", newDepartment);
      await setDoc(doc(db, "departments", formData.id), newDepartment);
      console.log("Đã thêm phòng ban vào Firestore thành công");

      // Cập nhật phòng ban cho các thành viên trong Firestore
      if (selectedUsers.length > 0) {
        console.log(
          "Cập nhật phòng ban cho",
          selectedUsers.length,
          "thành viên"
        );
        for (const userId of selectedUsers) {
          const userRef = doc(db, "users", userId);
          await setDoc(userRef, { department: formData.id }, { merge: true });
          console.log("Đã cập nhật phòng ban cho người dùng:", userId);
        }
      }

      // Đồng bộ với localStorage để đảm bảo tương thích
      if (typeof window !== "undefined") {
        const departments = JSON.parse(
          localStorage.getItem("departments") || "[]"
        );
        departments.push(newDepartment);
        localStorage.setItem("departments", JSON.stringify(departments));

        if (selectedUsers.length > 0) {
          const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
          const updatedUsers = storedUsers.map((user: User) => {
            if (selectedUsers.includes(user.id)) {
              return { ...user, department: formData.id };
            }
            return user;
          });
          localStorage.setItem("users", JSON.stringify(updatedUsers));
        }
      }

      // Hiển thị thông báo thành công
      setShowSuccess(true);
      setShowError(false);

      toast({
        title: "Thành công",
        description: `Phòng ban ${newDepartment.name} đã được tạo thành công.`,
      });

      // Gọi callback để cập nhật danh sách phòng ban ngay lập tức
      if (onDepartmentAdded) {
        onDepartmentAdded();
      }

      // Đóng dialog sau 1 giây
      setTimeout(() => {
        resetForm();
        // Tìm và click nút đóng dialog
        const closeButton = document.querySelector(
          "[data-dialog-close]"
        ) as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi thêm phòng ban:", error);
      setErrorMessage(
        `Lỗi khi thêm phòng ban: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="max-h-[80vh] pr-4 -mr-4">
      <div className="space-y-6 pr-4">
        {showSuccess && (
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

        {showError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên Phòng Ban <span className="text-red-500">*</span>
                  {nameExists && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập tên phòng ban"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={
                    nameExists
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  required
                />
                {nameExists && (
                  <p className="text-sm text-red-500">
                    Tên phòng ban đã tồn tại
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id" className="text-sm font-medium">
                  ID Phòng Ban <span className="text-red-500">*</span>
                  {idExists && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="id"
                  placeholder="Nhập ID phòng ban (ví dụ: rd, marketing)"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  className={
                    idExists ? "border-red-500 focus-visible:ring-red-500" : ""
                  }
                  required
                />
                {idExists && (
                  <p className="text-sm text-red-500">
                    ID phòng ban đã tồn tại
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô Tả <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả phòng ban"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[80px] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager" className="text-sm font-medium">
                Trưởng Phòng Ban
              </Label>
              <Select
                value={formData.manager}
                onValueChange={(value) => handleChange("manager", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trưởng phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Quyền Truy Cập</Label>
              <div className="border rounded-md p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {accessRights.map((right) => (
                    <div key={right.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`right-${right.id}`}
                        checked={formData.accessRights.includes(right.id)}
                        onCheckedChange={(checked) =>
                          handleAccessRightChange(right.id, checked as boolean)
                        }
                      />
                      <div className="grid gap-1 leading-none">
                        <label
                          htmlFor={`right-${right.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {right.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {right.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
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
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading || idExists || nameExists || showSuccess}
            >
              {isLoading ? (
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
