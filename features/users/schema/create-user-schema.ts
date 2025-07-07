import { z } from "zod";
import { UserRoleEnum } from "@/features/auth/constants";

export const createUserInputSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(6, { message: "Họ tên phải dài hơn 6 ký tự" }),
    userName: z
      .string()
      .trim()
      .min(6, { message: "Tên đăng nhập phải dài hơn 6 ký tự" }),
    email: z.string().trim().email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải dài hơn 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Xác nhận mật khẩu phải dài hơn 6 ký tự" }),
    role: z.nativeEnum(UserRoleEnum).default(UserRoleEnum.USER).optional(),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\d{9,11}$/, { message: "Số điện thoại gồm 9–15 chữ số" }),
    departmentId: z.number().nullable().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Xác nhận mật khẩu không khớp",
      });
    }
  });

export type CreateUserInputType = z.infer<typeof createUserInputSchema>;
