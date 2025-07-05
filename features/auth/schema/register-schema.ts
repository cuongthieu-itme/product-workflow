import { z } from "zod";
import { UserRoleEnum } from "../constants";

export const registerInputSchema = z
  .object({
    fullName: z
      .string()
      .min(6, { message: "Họ và tên phải có ít nhất 6 ký tự" }),
    userName: z
      .string()
      .trim()
      .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" }),
    email: z.string().trim().email({ message: "Địa chỉ email không hợp lệ" }),
    password: z
      .string()
      .trim()
      .min(6, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
    confirmPassword: z
      .string()
      .trim()
      .min(6, { message: "Xác nhận mật khẩu phải có ít nhất 8 ký tự" }),
    role: z.enum(
      [UserRoleEnum.USER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
      {
        message:
          "Vai trò phải là một trong các giá trị 'USER', 'ADMIN', 'SUPER_ADMIN'",
      }
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInputType = z.infer<typeof registerInputSchema>;
