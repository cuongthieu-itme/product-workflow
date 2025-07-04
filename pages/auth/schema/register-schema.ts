import { z } from "zod";
import { UserRoleEnum } from "../constants";

export const registerInputSchema = z.object({
  fullName: z.string().min(1, { message: "Họ và tên là bắt buộc" }),
  userName: z.string().min(1, { message: "Tên người dùng là bắt buộc" }),
  email: z.string().email({ message: "Địa chỉ email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  role: z.enum(
    [UserRoleEnum.USER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    {
      message:
        "Vai trò phải là một trong các giá trị 'USER', 'ADMIN', 'SUPER_ADMIN'",
    }
  ),
});

export type RegisterInputType = z.infer<typeof registerInputSchema>;
